import { useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Dropcursor from '@tiptap/extension-dropcursor';
import { common, createLowlight } from 'lowlight';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import {
  HiCode,
  HiLink,
  HiPhotograph,
  HiMinusSm,
  HiEye,
  HiPencil,
  HiUpload,
  HiDocumentText,
  HiArchive,
  HiTemplate,
} from 'react-icons/hi';

const lowlight = createLowlight(common);

// Max file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// ZIP security limits
const MAX_ZIP_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_EXTRACTED_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_ZIP_FILE_COUNT = 100;
const ALLOWED_CONTENT_EXTENSIONS = ['.md', '.html', '.markdown'];
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const ALLOWED_ZIP_EXTENSIONS = [...ALLOWED_CONTENT_EXTENSIONS, ...ALLOWED_IMAGE_EXTENSIONS];

/**
 * Get the file extension (lowercased, with dot).
 */
function getExt(filename) {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot).toLowerCase();
}

/**
 * Get the basename of a path (last segment).
 */
function basename(filepath) {
  return filepath.split('/').pop().split('\\').pop();
}

/**
 * Upload a Blob/File to the server and return the hosted URL.
 * Skips the MIME-type whitelist check since ZIP-extracted blobs
 * may not have a reliable `type`; uses extension-based validation instead.
 */
async function uploadImageBlob(blob, filename) {
  const ext = getExt(filename);
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported image type: ${ext}`);
  }

  const mimeMap = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
  const file = new File([blob], filename, { type: mimeMap[ext] || 'application/octet-stream' });

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Image ${filename} is too large (max 5 MB).`);
  }

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/upload-image.php', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  if (!data.url) throw new Error('Upload did not return a URL');
  return data.url;
}

/**
 * Process HTML string: find all <img src="..."> with local paths,
 * match them against a Map<basename, Blob>, upload, and rewrite src.
 * Returns the rewritten HTML string.
 */
async function processHtmlImages(html, imageMap) {
  // Parse the HTML in a temporary DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const imgs = doc.querySelectorAll('img[src]');

  for (const img of imgs) {
    const src = img.getAttribute('src') || '';
    // Skip absolute URLs (already hosted)
    if (/^https?:\/\//i.test(src) || src.startsWith('data:')) continue;

    // Extract the filename from the local path
    const name = basename(src);
    const blob = imageMap.get(name.toLowerCase());
    if (blob) {
      try {
        const url = await uploadImageBlob(blob, name);
        img.setAttribute('src', url);
      } catch (err) {
        console.warn(`Failed to upload image ${name}:`, err);
      }
    }
  }

  return doc.body.innerHTML;
}

/**
 * Import raw HTML content: sanitize, process images, return clean HTML.
 */
async function importHtmlContent(rawHtml, imageMap = new Map()) {
  // 1. Process images first (before sanitization strips src paths)
  let html = await processHtmlImages(rawHtml, imageMap);
  // 2. Sanitize
  html = DOMPurify.sanitize(html, {
    ADD_TAGS: ['img'],
    ADD_ATTR: ['src', 'alt', 'href', 'target', 'rel', 'class'],
  });
  return html;
}

/**
 * Validate and extract a ZIP file. Returns { contentFile: { name, text }, images: Map<basename, Blob> }
 */
async function extractZip(file) {
  // Size check
  if (file.size > MAX_ZIP_SIZE) {
    throw new Error('ZIP file is too large. Maximum size is 10 MB.');
  }

  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files).filter((f) => !f.dir);

  // File count check
  if (entries.length > MAX_ZIP_FILE_COUNT) {
    throw new Error(`ZIP contains too many files (${entries.length}). Maximum is ${MAX_ZIP_FILE_COUNT}.`);
  }

  let totalSize = 0;
  const contentCandidates = []; // { name, text, ext, size }
  const images = new Map(); // basename (lowercase) -> Blob

  for (const entry of entries) {
    const name = entry.name;

    // Path traversal protection
    if (name.includes('..') || name.startsWith('/')) {
      throw new Error(`Unsafe path detected: ${name}`);
    }

    // Skip hidden files and __MACOSX
    if (basename(name).startsWith('.') || name.startsWith('__MACOSX')) continue;

    const ext = getExt(name);

    // Only allow whitelisted extensions
    if (!ALLOWED_ZIP_EXTENSIONS.includes(ext)) {
      console.warn(`Skipping disallowed file in ZIP: ${name}`);
      continue;
    }

    // Extracted size tracking
    const data = await entry.async('arraybuffer');
    totalSize += data.byteLength;
    if (totalSize > MAX_EXTRACTED_SIZE) {
      throw new Error('Extracted content exceeds 50 MB limit.');
    }

    if (ALLOWED_CONTENT_EXTENSIONS.includes(ext)) {
      const text = new TextDecoder().decode(data);
      contentCandidates.push({ name, text, ext, size: data.byteLength });
    } else if (ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      const blob = new Blob([data]);
      images.set(basename(name).toLowerCase(), blob);
    }
  }

  // Select best content file: prefer .md over .html, largest file wins ties
  let contentFile = null;
  if (contentCandidates.length > 0) {
    const mdFiles = contentCandidates.filter((f) => f.ext === '.md' || f.ext === '.markdown');
    const htmlFiles = contentCandidates.filter((f) => f.ext === '.html');

    const pickLargest = (arr) => arr.sort((a, b) => b.size - a.size)[0];

    contentFile = mdFiles.length > 0 ? pickLargest(mdFiles) : pickLargest(htmlFiles);
  }

  if (!contentFile) {
    throw new Error('No .md or .html content file found in the ZIP.');
  }

  return { contentFile, images };
}

/**
 * Compress an image client-side before uploading.
 * Resizes to max 1920px on the longest side and converts to JPEG at 0.85 quality.
 */
function compressImage(file, maxDimension = 1920, quality = 0.85) {
  return new Promise((resolve) => {
    // Skip compression for small files (<500KB) and GIFs
    if (file.size < 500 * 1024 || file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Only resize if larger than maxDimension
      if (width <= maxDimension && height <= maxDimension) {
        resolve(file);
        return;
      }

      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressed = new File([blob], file.name, {
              type: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
            });
            resolve(compressed);
          } else {
            resolve(file);
          }
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Upload an image file to the server.
 * Returns the public URL of the uploaded image.
 */
async function uploadImage(file, onProgress) {
  // Validate type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP.');
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  // Compress
  const compressed = await compressImage(file);

  const formData = new FormData();
  formData.append('image', compressed);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.url) {
            resolve(data.url);
          } else {
            reject(new Error(data.error || 'Upload failed'));
          }
        } catch {
          reject(new Error('Invalid server response'));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.error || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', '/upload-image.php');
    xhr.send(formData);
  });
}

// ─────────────────────────────────────────────
// Toolbar Button Component
// ─────────────────────────────────────────────
function ToolbarButton({ onClick, isActive, title, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`tiptap-toolbar-btn ${isActive ? 'is-active' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// Toolbar Divider
// ─────────────────────────────────────────────
function ToolbarDivider() {
  return <div className="tiptap-toolbar-divider" />;
}

// ─────────────────────────────────────────────
// Main TipTap Editor Component
// ─────────────────────────────────────────────
export default function TipTapEditor({ value, onChange, placeholder = 'Start writing...' }) {
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const imageInputRef = useRef(null);
  const mdInputRef = useRef(null);
  const htmlInputRef = useRef(null);
  const zipInputRef = useRef(null);

  const handleImageUpload = useCallback(
    async (file) => {
      if (!file) return;

      try {
        setUploadProgress(0);
        toast.loading('Uploading image...', { id: 'img-upload' });
        const url = await uploadImage(file, setUploadProgress);
        toast.success('Image uploaded!', { id: 'img-upload' });
        setUploadProgress(null);
        return url;
      } catch (err) {
        toast.error(err.message, { id: 'img-upload' });
        setUploadProgress(null);
        return null;
      }
    },
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Replaced by CodeBlockLowlight
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Dropcursor.configure({
        color: '#ef2f88',
        width: 2,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap-content',
      },
      handleDrop: (view, event) => {
        const hasFiles =
          event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length;
        if (!hasFiles) return false;

        const images = Array.from(event.dataTransfer.files).filter((f) =>
          ALLOWED_IMAGE_TYPES.includes(f.type)
        );
        if (images.length === 0) return false;

        event.preventDefault();

        images.forEach(async (image) => {
          const url = await handleImageUpload(image);
          if (url) {
            const { schema } = view.state;
            const node = schema.nodes.image.create({ src: url });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
          }
        });

        return true;
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter((item) => ALLOWED_IMAGE_TYPES.includes(item.type));

        if (imageItems.length === 0) return false;

        event.preventDefault();

        imageItems.forEach(async (item) => {
          const file = item.getAsFile();
          if (!file) return;

          const url = await handleImageUpload(file);
          if (url) {
            const { schema } = view.state;
            const node = schema.nodes.image.create({ src: url });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
          }
        });

        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange?.(html);
    },
  });

  // Sync external value changes (e.g. when loading a post for editing)
  // We only set content when the editor is empty and value changes significantly
  // to avoid cursor-jump issues
  const lastValueRef = useRef(value);
  if (editor && value !== lastValueRef.current) {
    const currentHTML = editor.getHTML();
    // Only update if the editor doesn't already have this content
    if (value && currentHTML !== value && currentHTML === '<p></p>') {
      editor.commands.setContent(value, false);
    }
    lastValueRef.current = value;
  }

  // ─── Image upload via toolbar ─────────
  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const url = await handleImageUpload(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    // Reset input so same file can be picked again
    e.target.value = '';
  };

  // ─── Link insertion ─────────
  const handleLinkClick = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');

    if (url === null) return; // Cancelled

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  // ─── Markdown import ─────────
  const handleMarkdownImportClick = () => {
    mdInputRef.current?.click();
  };

  const handleMarkdownFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      toast.error('Please select a Markdown (.md) file');
      return;
    }

    try {
      const text = await file.text();
      const html = await marked.parse(text);
      const cleanHtml = DOMPurify.sanitize(html);
      editor.commands.setContent(cleanHtml, true);
      toast.success('Markdown imported successfully!');
    } catch (err) {
      toast.error('Failed to parse markdown file');
      console.error(err);
    }

    e.target.value = '';
  };

  // ─── HTML import ─────────
  const handleHtmlImportClick = () => {
    htmlInputRef.current?.click();
  };

  const handleHtmlFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast.error('Please select an HTML (.html) file');
      e.target.value = '';
      return;
    }

    try {
      setImportProgress('Importing HTML…');
      const rawHtml = await file.text();
      const cleanHtml = await importHtmlContent(rawHtml);
      editor.commands.setContent(cleanHtml, true);
      toast.success('HTML imported successfully!');
    } catch (err) {
      toast.error(`HTML import failed: ${err.message}`);
      console.error(err);
    } finally {
      setImportProgress(null);
    }

    e.target.value = '';
  };

  // ─── ZIP import ─────────
  const handleZipImportClick = () => {
    zipInputRef.current?.click();
  };

  const handleZipFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (!file.name.endsWith('.zip')) {
      toast.error('Please select a ZIP (.zip) file');
      e.target.value = '';
      return;
    }

    try {
      setImportProgress('Extracting ZIP…');
      const { contentFile, images } = await extractZip(file);

      // Upload images
      let uploaded = 0;
      const totalImages = images.size;
      const uploadedMap = new Map(); // basename (lowercase) -> hosted URL

      for (const [name, blob] of images) {
        try {
          setImportProgress(`Uploading image ${++uploaded}/${totalImages}…`);
          const url = await uploadImageBlob(blob, name);
          uploadedMap.set(name.toLowerCase(), url);
        } catch (err) {
          console.warn(`Failed to upload ${name}:`, err);
        }
      }

      // Parse content
      setImportProgress('Processing content…');
      let html;

      if (contentFile.ext === '.html') {
        html = contentFile.text;
      } else {
        // Markdown
        html = await marked.parse(contentFile.text);
      }

      // Rewrite image paths: replace local src with uploaded URLs
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const imgs = doc.querySelectorAll('img[src]');

      for (const img of imgs) {
        const src = img.getAttribute('src') || '';
        if (/^https?:\/\//i.test(src) || src.startsWith('data:')) continue;

        const name = basename(src).toLowerCase();
        const hostedUrl = uploadedMap.get(name);
        if (hostedUrl) {
          img.setAttribute('src', hostedUrl);
        }
      }

      html = doc.body.innerHTML;

      // Sanitize
      const cleanHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['img'],
        ADD_ATTR: ['src', 'alt', 'href', 'target', 'rel', 'class'],
      });

      editor.commands.setContent(cleanHtml, true);
      toast.success(`Imported! ${uploaded} image(s) uploaded.`);
    } catch (err) {
      toast.error(`ZIP import failed: ${err.message}`);
      console.error(err);
    } finally {
      setImportProgress(null);
    }

    e.target.value = '';
  };

  if (!editor) return null;

  return (
    <div className="tiptap-editor-wrapper">
      {/* Toolbar */}
      <div className="tiptap-toolbar">
        <div className="tiptap-toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            H2
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <em>I</em>
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <HiCode size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{'{}'}</span>
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton onClick={handleLinkClick} isActive={editor.isActive('link')} title="Link">
            <HiLink size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={handleImageButtonClick} title="Insert Image">
            <HiPhotograph size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Divider"
          >
            <HiMinusSm size={16} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            •≡
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            1.
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton onClick={handleMarkdownImportClick} title="Import Markdown File">
            <HiDocumentText size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={handleHtmlImportClick} title="Import HTML File">
            <HiTemplate size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={handleZipImportClick} title="Import ZIP Archive">
            <HiArchive size={16} />
          </ToolbarButton>
        </div>

        {/* Preview toggle */}
        <div className="tiptap-toolbar-group">
          <ToolbarButton
            onClick={() => setPreviewMode(false)}
            isActive={!previewMode}
            title="Write"
          >
            <HiPencil size={14} />
            <span>Write</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setPreviewMode(true)}
            isActive={previewMode}
            title="Preview"
          >
            <HiEye size={14} />
            <span>Preview</span>
          </ToolbarButton>
        </div>
      </div>

      {/* Upload progress bar */}
      {uploadProgress !== null && (
        <div className="tiptap-upload-progress">
          <div className="tiptap-upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
          <span className="tiptap-upload-progress-text">
            <HiUpload size={12} />
            Uploading… {uploadProgress}%
          </span>
        </div>
      )}

      {/* Import progress indicator */}
      {importProgress && (
        <div className="tiptap-upload-progress">
          <div className="tiptap-upload-progress-bar" style={{ width: '100%' }} />
          <span className="tiptap-upload-progress-text">
            <HiArchive size={12} />
            {importProgress}
          </span>
        </div>
      )}

      {/* Editor / Preview */}
      {previewMode ? (
        <div className="tiptap-preview">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(editor.getHTML()),
            }}
          />
        </div>
      ) : (
        <EditorContent editor={editor} className="tiptap-editor" />
      )}

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleImageFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={mdInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={handleMarkdownFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={htmlInputRef}
        type="file"
        accept=".html,.htm"
        onChange={handleHtmlFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip"
        onChange={handleZipFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}
