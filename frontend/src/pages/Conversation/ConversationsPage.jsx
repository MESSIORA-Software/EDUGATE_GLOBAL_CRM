import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle, AlignLeft, Bold, Check, CheckCheck, CheckCircle2, ChevronDown, Download,
  FileText, Filter, Forward, Heart, Image, ImagePlus, Inbox, Italic, Link2, List, ListOrdered,
  LoaderCircle, Lock, Mail, Maximize2, MessageCircle, Minimize2, Minus, MoreVertical,
  Paperclip, PenLine, PhoneCall, Plus, QrCode, Quote, Redo2, RefreshCw, Reply, RotateCcw,
  RotateCw, Search, Send, Smile, Star, Strikethrough, Target, ThumbsUp, Trash2, Underline, Undo2,
  UserRound, X,
} from 'lucide-react';
import conversationService from '../../services/Conversation/conversationService';
import AddOpportunityModal from '../../components/Modals/Admin/Student/AddOpportunityModal';
import useAuth from '../../hooks/Auth/useAuth';
import { getUserRole } from '../../utils/roleUtils';

const channelConfig = {
  messenger: { label: 'Messenger', activeClass: 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold' },
  whatsapp: { label: 'WhatsApp', activeClass: 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold' },
  email: { label: 'Email', activeClass: 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold' },
  sms: { label: 'Messages & calls', activeClass: 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold' },
};

const renderChannelIcon = (channelId, className = 'h-4 w-4 shrink-0') => {
  switch (channelId) {
    case 'messenger':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="channelMessengerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00B2FF" />
              <stop offset="50%" stopColor="#006AFF" />
              <stop offset="100%" stopColor="#A033FF" />
            </linearGradient>
          </defs>
          <path
            fill="url(#channelMessengerGrad)"
            d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.43 3.19 7.07.16.13.26.33.26.54l-.07 1.7c-.03.74.77 1.25 1.41.87l1.91-1.12c.16-.1.35-.13.54-.1.87.23 1.79.35 2.76.35 5.64 0 10-4.13 10-9.7S17.64 2 12 2z"
          />
          <path
            fill="#ffffff"
            d="M13.06 15.06l-2.58-2.75-5.04 2.75 5.54-5.88 2.65 2.75 4.97-2.75-5.54 5.88z"
          />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            fill="#25D366"
            d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"
          />
          <path
            fill="#ffffff"
            d="M17.82 16.07c-.24.68-1.2 1.25-1.95 1.34-.51.06-1.17.09-3.39-.83-2.84-1.18-4.66-4.08-4.8-4.27-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07 1-2.35.24-.25.53-.31.71-.31.18 0 .35 0 .5.01.16.01.37-.06.58.44.22.52.74 1.8.8 1.93.07.13.11.28.02.46-.09.18-.14.28-.27.44-.13.16-.28.35-.4.47-.13.13-.27.28-.12.54.16.26.7 1.15 1.5 1.86 1.03.92 1.9 1.21 2.17 1.34.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.59.75 1.86.88.27.13.45.2.52.31.06.11.06.64-.18 1.32z"
          />
        </svg>
      );
    case 'email':
      return (
        <svg className={className} viewBox="0 0 48 48">
          <path fill="#4285F4" d="M44 11.2V38c0 2.2-1.8 4-4 4H34V18.7L24 26.2 14 18.7V42H8c-2.2 0-4-1.8-4-4V11.2c0-2.8 3.1-4.4 5.4-2.7L24 19.8l14.6-11.3c2.3-1.7 5.4-.1 5.4 2.7z" />
          <path fill="#34A853" d="M34 42h6c2.2 0 4-1.8 4-4V18.7L34 26.2V42z" />
          <path fill="#EA4335" d="M14 18.7V42H8c-2.2 0-4-1.8-4-4V18.7l10 7.5V18.7z" />
          <path fill="#FBBC05" d="M4 11.2c0-2.8 3.1-4.4 5.4-2.7L24 19.8 4 11.2z" />
          <path fill="#C5221F" d="M44 11.2c0-2.8-3.1-4.4-5.4-2.7L24 19.8l20-8.6V11.2z" />
        </svg>
      );
    case 'sms':
      return <PhoneCall className={`${className} text-rose-500`} />;
    default:
      return null;
  }
};

const getErrorMessage = (error) => error?.response?.data?.message || 'Unable to load conversations.';

const formatEmailDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const parseEmailContent = (rawContent) => {
  if (!rawContent) return { subject: '', body: '' };
  if (rawContent.startsWith('[Subject:')) {
    const endIdx = rawContent.indexOf(']\n\n');
    if (endIdx !== -1) {
      return {
        subject: rawContent.substring(9, endIdx).trim(),
        body: rawContent.substring(endIdx + 3).trim(),
      };
    }
  }
  return { subject: '', body: rawContent };
};

const MESSENGER_REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
];

const parseMessageContent = (rawContent) => {
  if (!rawContent) return { replyQuote: null, body: '' };
  if (rawContent.startsWith('[Reply:')) {
    const endIdx = rawContent.indexOf(']\n\n');
    if (endIdx !== -1) {
      const header = rawContent.substring(7, endIdx);
      const colonIdx = header.indexOf(':');
      const sender = colonIdx !== -1 ? header.substring(0, colonIdx).trim() : 'Replied';
      const quote = colonIdx !== -1 ? header.substring(colonIdx + 1).trim() : header.trim();
      return {
        replyQuote: { sender, text: quote },
        body: rawContent.substring(endIdx + 3).trim(),
      };
    }
  }
  return { replyQuote: null, body: rawContent };
};

function ConversationList({ conversations, selectedId, onSelect, search, channel, emailFolder }) {
  const isWhatsApp = channel === 'whatsapp';
  const isEmail = channel === 'email';
  const isSentFolder = isEmail && emailFolder === 'sent';
  const isReceivedFolder = isEmail && emailFolder === 'received';
  const isStarredFolder = isEmail && emailFolder === 'starred';
  const defaultLabel = isWhatsApp ? 'WhatsApp User' : isEmail ? 'Email Contact' : 'Facebook user';
  const channelLabel = isWhatsApp
    ? 'WhatsApp'
    : isEmail
      ? (isSentFolder ? 'sent email' : isReceivedFolder ? 'received email' : isStarredFolder ? 'starred email' : 'inbox email')
      : 'Messenger';

  const filtered = conversations.filter((item) => {
    const name = item.clients?.name || (item.channel_client_id ? (isWhatsApp ? `+${item.channel_client_id}` : item.channel_client_id) : defaultLabel);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="divide-y divide-slate-100">
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No {channelLabel} conversations found.
        </div>
      ) : filtered.map((item) => {
        const name = item.clients?.name || (item.channel_client_id ? (isWhatsApp ? `+${item.channel_client_id}` : item.channel_client_id) : defaultLabel);
        const isSelected = selectedId === item.conversation_id;
        const activeBg = 'bg-blue-50/50 border-r-2 border-blue-600';
        const hoverBg = 'hover:bg-slate-50/80';
        const avatarColor = 'bg-slate-100 text-slate-700 border border-slate-200';

        const parsedLast = isEmail ? parseEmailContent(item.last_message) : null;
        const lastSubject = parsedLast?.subject;

        return (
          <button
            key={item.conversation_id}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full p-4 text-left transition cursor-pointer ${isSelected ? activeBg : hoverBg}`}
          >
            <div className="flex items-start gap-3">
              <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarColor} shadow-2xs`}>
                {isEmail ? (
                  isSentFolder ? (
                    <Send className="h-4 w-4 text-slate-600" />
                  ) : isStarredFolder ? (
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  ) : (
                    <Mail className="h-4 w-4 text-slate-600" />
                  )
                ) : (
                  <UserRound className="h-5 w-5 text-slate-600" />
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {isSentFolder ? `To: ${name}` : name}
                  </p>
                  <time className="shrink-0 text-[10px] text-slate-400">
                    {item.last_message_at ? new Date(item.last_message_at).toLocaleDateString() : ''}
                  </time>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {lastSubject ? lastSubject : (item.status === 'open' ? (isSentFolder ? 'Sent email' : isReceivedFolder ? 'Received email' : isStarredFolder ? 'Starred email' : 'Open conversation') : item.status)}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Gmail-style New Message Compose Popup Modal (matches authentic Gmail interface)
function EmailComposeModal({
  isOpen,
  onClose,
  onSend,
  onSaveDraft,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  conversationId = null,
}) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showFormatting, setShowFormatting] = useState(true);
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [fontSize, setFontSize] = useState('text-xs');
  const [textAlign, setTextAlign] = useState('text-left');
  const [isConfidential, setIsConfidential] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTo(initialTo || '');
      setSubject(initialSubject || '');
      setBody(initialBody || '');
      setAttachment(null);
      setCc('');
      setBcc('');
      setShowCc(false);
      setShowBcc(false);
      setIsMinimized(false);
      setIsConfidential(false);
    }
  }, [isOpen, initialTo, initialSubject, initialBody]);

  if (!isOpen) return null;

  const handleClearForm = () => {
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setAttachment(null);
    setShowCc(false);
    setShowBcc(false);
    setIsConfidential(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleDiscard = () => {
    handleClearForm();
    onClose();
  };

  const handleDraftSave = () => {
    if (onSaveDraft && (to.trim() || subject.trim() || body.trim())) {
      onSaveDraft({
        to: to.trim(),
        cc: cc.trim(),
        bcc: bcc.trim(),
        subject: subject.trim() || '(No Subject)',
        body: body.trim(),
        savedAt: new Date().toISOString(),
      });
    }
    handleClearForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!to.trim() || sending) return;
    setSending(true);
    try {
      await onSend({
        conversationId,
        to: to.trim(),
        cc: cc.trim() || undefined,
        bcc: bcc.trim() || undefined,
        subject: subject.trim() || '(No Subject)',
        content: body.trim(),
        attachment: attachment || null,
      });
      handleClearForm();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  // Text formatting helpers
  const wrapSelection = (before, after = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = body;
    const selected = current.substring(start, end);
    const replacement = before + (selected || 'text') + after;
    const next = current.substring(0, start) + replacement + current.substring(end);
    setBody(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + (selected ? selected.length : 4));
    }, 0);
  };

  const insertPrefixToLines = (prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = body;
    const selected = current.substring(start, end) || 'List item';
    const lines = selected.split('\n').map((l, idx) => (typeof prefix === 'function' ? `${prefix(idx + 1)}${l}` : `${prefix}${l}`));
    const replacement = lines.join('\n');
    const next = current.substring(0, start) + replacement + current.substring(end);
    setBody(next);
    setTimeout(() => {
      el.focus();
    }, 0);
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL (e.g. https://example.com):', 'https://');
    if (url && url !== 'https://') {
      wrapSelection('[', `](${url})`);
    }
  };

  const handleInsertEmoji = (emoji = '😊') => {
    const el = textareaRef.current;
    if (!el) {
      setBody((prev) => prev + emoji);
      return;
    }
    const start = el.selectionStart;
    const next = body.substring(0, start) + emoji + body.substring(start);
    setBody(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleInsertSignature = () => {
    const signature = '\n\n--\nEdugate Global CRM\nsupport@edugate.lk';
    setBody((prev) => prev + signature);
  };

  return (
    <div
      className={`fixed z-50 bg-white shadow-2xl border border-slate-300 transition-all duration-200 flex flex-col ${isMaximized
        ? 'inset-6 sm:inset-10 rounded-2xl'
        : isMinimized
          ? 'bottom-0 right-6 w-80 h-10 rounded-t-xl'
          : 'bottom-0 right-6 w-[580px] max-w-[92vw] h-[560px] max-h-[88vh] rounded-t-xl'
        }`}
    >
      {/* Header Bar - Authentic Gmail Soft Off-White Header */}
      <div className="flex h-10 items-center justify-between rounded-t-xl bg-[#f2f6fc] border-b border-slate-200/90 px-4 text-slate-800 select-none">
        <span className="text-xs font-semibold truncate text-slate-800">
          {subject.trim() ? subject : 'New Message'}
        </span>
        <div className="flex items-center gap-1 text-slate-500">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-200/80 hover:text-slate-900 rounded transition cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          {!isMinimized && (
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:bg-slate-200/80 hover:text-slate-900 rounded transition cursor-pointer"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              <Maximize2 className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={handleDiscard}
            className="p-1 hover:bg-slate-200/80 hover:text-slate-900 rounded transition cursor-pointer"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden bg-white">
          {/* To Field */}
          <div className="flex items-center border-b border-slate-200/70 px-4 py-1.5 text-xs">
            <span className="w-8 text-slate-500 font-normal">To</span>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder=""
              required
              className="flex-1 bg-transparent outline-none text-slate-800 text-xs py-1"
            />
            <div className="flex items-center gap-2.5 text-xs font-normal text-slate-500">
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="hover:text-slate-900 hover:underline cursor-pointer"
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="hover:text-slate-900 hover:underline cursor-pointer"
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {/* Cc Field */}
          {showCc && (
            <div className="flex items-center border-b border-slate-200/70 px-4 py-1.5 text-xs animate-in fade-in duration-100">
              <span className="w-8 text-slate-500 font-normal">Cc</span>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Cc recipients (comma separated)"
                className="flex-1 bg-transparent outline-none text-slate-800 text-xs py-1"
              />
            </div>
          )}

          {/* Bcc Field */}
          {showBcc && (
            <div className="flex items-center border-b border-slate-200/70 px-4 py-1.5 text-xs animate-in fade-in duration-100">
              <span className="w-8 text-slate-500 font-normal">Bcc</span>
              <input
                type="text"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="Bcc recipients (comma separated)"
                className="flex-1 bg-transparent outline-none text-slate-800 text-xs py-1"
              />
            </div>
          )}

          {/* Subject Field */}
          <div className="border-b border-slate-200/70 px-4 py-2">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full bg-transparent outline-none text-slate-800 font-normal text-xs placeholder:text-slate-400"
            />
          </div>

          {/* Confidential Mode Banner */}
          {isConfidential && (
            <div className="mx-4 mt-2 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-800 border border-blue-200">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span className="font-semibold text-[11px]">Confidential mode: Recipients won't have options to forward, copy, or print.</span>
              </div>
              <button type="button" onClick={() => setIsConfidential(false)} className="text-blue-500 hover:text-blue-800 cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Attachment list if added */}
          {attachment && (
            <div className="mx-4 mt-2 flex items-center justify-between rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 border border-slate-200/80">
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span className="truncate font-medium">{attachment.name}</span>
                <span className="text-slate-400">({(attachment.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Email Body Canvas */}
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Compose your email here..."
            className={`flex-1 resize-none p-4 text-xs text-slate-800 outline-none leading-relaxed placeholder:text-slate-400 ${fontFamily} ${fontSize} ${textAlign}`}
          />

          {/* Gmail Formatting Bar (Above action bar, toggled by 'Aa') */}
          {showFormatting && (
            <div className="flex items-center gap-1 border-t border-slate-200/80 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-600 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  textareaRef.current?.focus();
                  document.execCommand('undo');
                }}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Undo"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  textareaRef.current?.focus();
                  document.execCommand('redo');
                }}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Redo"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-slate-300 mx-1" />

              {/* Font Family selector */}
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="bg-transparent border-0 text-slate-700 text-xs py-0.5 px-1 font-medium hover:bg-slate-200/70 rounded cursor-pointer outline-none"
              >
                <option value="font-sans">Sans Serif</option>
                <option value="font-serif">Serif</option>
                <option value="font-mono">Monospace</option>
              </select>

              {/* Font Size selector */}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="bg-transparent border-0 text-slate-700 text-xs py-0.5 px-1 font-medium hover:bg-slate-200/70 rounded cursor-pointer outline-none"
              >
                <option value="text-[11px]">Small</option>
                <option value="text-xs">Normal</option>
                <option value="text-sm">Large</option>
                <option value="text-base">Huge</option>
              </select>

              <div className="h-4 w-[1px] bg-slate-300 mx-1" />

              {/* Bold */}
              <button
                type="button"
                onClick={() => wrapSelection('**')}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 cursor-pointer font-bold"
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => wrapSelection('*')}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 cursor-pointer italic"
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>

              {/* Underline */}
              <button
                type="button"
                onClick={() => wrapSelection('<u>', '</u>')}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 cursor-pointer underline"
                title="Underline (Ctrl+U)"
              >
                <Underline className="h-3.5 w-3.5" />
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onClick={() => wrapSelection('~~')}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
                title="Strikethrough"
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-slate-300 mx-1" />

              {/* Align Left / Center */}
              <button
                type="button"
                onClick={() => setTextAlign((prev) => (prev === 'text-left' ? 'text-center' : 'text-left'))}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
                title="Align"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>

              {/* Numbered List */}
              <button
                type="button"
                onClick={() => insertPrefixToLines((n) => `${n}. `)}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
                title="Numbered list"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </button>

              {/* Bulleted List */}
              <button
                type="button"
                onClick={() => insertPrefixToLines('• ')}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
                title="Bulleted list"
              >
                <List className="h-3.5 w-3.5" />
              </button>

              {/* Quote */}
              <button
                type="button"
                onClick={() => insertPrefixToLines('> ')}
                className="p-1 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
                title="Quote"
              >
                <Quote className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Bottom Action Toolbar - Matching Gmail Image 2 */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-2">
            <div className="flex items-center gap-1">
              {/* Blue Pill Send Button with split dropdown arrow */}
              <div className="inline-flex items-center rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white shadow-xs overflow-hidden mr-1.5 transition">
                <button
                  type="submit"
                  disabled={sending || !to.trim()}
                  className="px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Send email"
                >
                  {sending ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>Send</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => alert('Email is set to send immediately on Send click.')}
                  className="px-2 py-1.5 hover:bg-[#0842a0] border-l border-blue-400/30 cursor-pointer"
                  title="More send options"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              {/* Formatting toggle icon 'Aa' */}
              <button
                type="button"
                onClick={() => setShowFormatting(!showFormatting)}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${showFormatting ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Formatting options"
              >
                Aa
              </button>

              {/* Attach files */}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Insert link */}
              <button
                type="button"
                onClick={handleInsertLink}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Insert link"
              >
                <Link2 className="h-4 w-4" />
              </button>

              {/* Insert emoji */}
              <button
                type="button"
                onClick={() => handleInsertEmoji('😊')}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Insert emoji"
              >
                <Smile className="h-4 w-4" />
              </button>

              {/* Insert image / photo */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Insert photo"
              >
                <Image className="h-4 w-4" />
              </button>

              {/* Toggle confidential mode */}
              <button
                type="button"
                onClick={() => setIsConfidential(!isConfidential)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${isConfidential ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Toggle confidential mode"
              >
                <Lock className="h-4 w-4" />
              </button>

              {/* Insert signature */}
              <button
                type="button"
                onClick={handleInsertSignature}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Insert signature"
              >
                <PenLine className="h-4 w-4" />
              </button>

              {/* More options */}
              <button
                type="button"
                onClick={() => alert('Email composer configured for Edugate CRM Gmail workspace.')}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Right side: Save Draft & Trash */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDraftSave}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                title="Save as Draft"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleDiscard}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                title="Discard draft"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ConversationsPage() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  const location = useLocation();
  const navigate = useNavigate();
  const routeParams = useParams();

  const initialChannel = location.state?.channel
    ? String(location.state.channel).toLowerCase()
    : 'messenger';

  const [activeChannel, setActiveChannel] = useState(initialChannel);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [messengerStatus, setMessengerStatus] = useState({ configured: false, connected: false });
  const fileInput = useRef(null);
  const messagesEnd = useRef(null);

  // Messenger Reaction, Reply & Thumbs Up states
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState(null);
  const [messageReactions, setMessageReactions] = useState(() => {
    try {
      const saved = localStorage.getItem('edugate_messenger_reactions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleReaction = (messageId, emoji) => {
    setMessageReactions((prev) => {
      const list = prev[messageId] || [];
      const exists = list.includes(emoji);
      const updated = exists ? list.filter((e) => e !== emoji) : [...list, emoji];
      const next = { ...prev, [messageId]: updated };
      try {
        localStorage.setItem('edugate_messenger_reactions', JSON.stringify(next));
      } catch { }
      return next;
    });
    setActiveReactionPickerId(null);
  };

  const sendThumbsUp = async () => {
    if (!selected || sending) return;
    setSending(true);
    setError('');
    try {
      await conversationService.sendMessage(selected.conversation_id, {
        content: '👍',
        media_source: 'system_storage',
        message_type: 'text',
      });
      await loadMessages(selected);
      await loadConversations(activeChannel);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  };

  // Email specific states
  const [emailFolder, setEmailFolder] = useState('inbox'); // 'inbox' | 'sent' | 'draft'
  const [showFullThreadInSent, setShowFullThreadInSent] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ connected: true, email: 'messiorasolutions@gmail.com' });
  const [emailSyncing, setEmailSyncing] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitial, setComposeInitial] = useState({ to: '', subject: '', body: '', conversationId: null });
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [openDetailsMessageId, setOpenDetailsMessageId] = useState(null);
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
  const [starredEmails, setStarredEmails] = useState(() => {
    try {
      const saved = localStorage.getItem('edugate_starred_emails');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleStarMessage = (message) => {
    const messageId = message.message_id;
    const convId = selected?.conversation_id;
    setStarredEmails((prev) => {
      const exists = prev.some((item) => item.messageId === messageId);
      const next = exists
        ? prev.filter((item) => item.messageId !== messageId)
        : [...prev, { messageId, conversationId: convId }];
      try {
        localStorage.setItem('edugate_starred_emails', JSON.stringify(next));
      } catch { }
      setSuccessBanner(exists ? 'Removed from saved list' : 'Already added to saved list');
      setTimeout(() => setSuccessBanner(''), 3000);
      return next;
    });
  };

  // Sync activeChannel if location state channel updates
  useEffect(() => {
    if (location.state?.channel) {
      const targetCh = String(location.state.channel).toLowerCase();
      if (['messenger', 'whatsapp', 'email', 'sms'].includes(targetCh) && targetCh !== activeChannel) {
        setActiveChannel(targetCh);
      }
    }
  }, [location.state?.channel]);

  // Saved Email Drafts
  const [draftsList, setDraftsList] = useState(() => {
    try {
      const saved = localStorage.getItem('edugate_email_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveDraftItem = (draftObj) => {
    const updated = [draftObj, ...draftsList];
    setDraftsList(updated);
    try {
      localStorage.setItem('edugate_email_drafts', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const deleteDraftItem = (index) => {
    const updated = draftsList.filter((_, i) => i !== index);
    setDraftsList(updated);
    try {
      localStorage.setItem('edugate_email_drafts', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // WhatsApp Linked Device states
  const [waStatus, setWaStatus] = useState('disconnected');
  const [waQrCode, setWaQrCode] = useState(null);
  const [waPhoneNumber, setWaPhoneNumber] = useState(null);
  const [waConnecting, setWaConnecting] = useState(false);

  const loadConversations = useCallback(async (channel = activeChannel) => {
    setLoading(true);
    setError('');
    try {
      const response = await conversationService.getConversations({ channel });
      const list = response?.data?.data || [];
      setConversations(list);

      const targetClientId = location.state?.clientId;
      const targetStudentName = (location.state?.studentName || '').toLowerCase().trim();

      let matchedConv = null;
      if (targetClientId || targetStudentName) {
        matchedConv = list.find((item) => {
          if (targetClientId && (String(item.client_id) === String(targetClientId) || String(item.clients?.client_id) === String(targetClientId))) {
            return true;
          }
          if (targetStudentName && item.contact_name?.toLowerCase().trim() === targetStudentName) {
            return true;
          }
          return false;
        });
      }

      if (matchedConv) {
        setSelected(matchedConv);
      } else if (targetClientId) {
        // Find or create conversation for this client & channel
        try {
          const createRes = await conversationService.getOrCreateClientConversation(targetClientId, channel);
          if (createRes?.data?.data) {
            const newConv = createRes.data.data;
            setConversations((prev) => [newConv, ...prev.filter((c) => c.conversation_id !== newConv.conversation_id)]);
            setSelected(newConv);
          } else {
            setSelected((current) => list.find((item) => item.conversation_id === current?.conversation_id) || list[0] || null);
          }
        } catch (getOrCreateErr) {
          console.warn('Could not get or create client conversation:', getOrCreateErr);
          setSelected((current) => list.find((item) => item.conversation_id === current?.conversation_id) || list[0] || null);
        }
      } else {
        setSelected((current) => list.find((item) => item.conversation_id === current?.conversation_id) || list[0] || null);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [activeChannel, location.state]);

  const loadMessages = useCallback(async (conversation) => {
    if (!conversation) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    try {
      const response = await conversationService.getMessages(conversation.conversation_id);
      setMessages(response?.data?.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const fetchWhatsAppStatus = useCallback(async () => {
    try {
      const response = await conversationService.getWhatsAppStatus();
      const data = response?.data?.data || {};
      setWaStatus(data.status || 'disconnected');
      setWaQrCode(data.qrCode || null);
      setWaPhoneNumber(data.phoneNumber || null);
      return data;
    } catch {
      return null;
    }
  }, []);

  const handleConnectWhatsApp = useCallback(async () => {
    setWaConnecting(true);
    try {
      const response = await conversationService.connectWhatsApp();
      const data = response?.data?.data || {};
      setWaStatus(data.status || 'connecting');
      setWaQrCode(data.qrCode || null);
      setWaPhoneNumber(data.phoneNumber || null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setWaConnecting(false);
    }
  }, []);

  const handleDisconnectWhatsApp = async () => {
    if (!window.confirm('Are you sure you want to disconnect WhatsApp from this CRM?')) return;
    try {
      await conversationService.disconnectWhatsApp();
      setWaStatus('disconnected');
      setWaQrCode(null);
      setWaPhoneNumber(null);
      await loadConversations(activeChannel);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSyncEmails = async () => {
    setEmailSyncing(true);
    try {
      await conversationService.syncEmails();
      await loadConversations('email');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEmailSyncing(false);
    }
  };

  useEffect(() => {
    loadConversations(activeChannel);
  }, [loadConversations, activeChannel]);

  useEffect(() => {
    loadMessages(selected);
  }, [loadMessages, selected]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WhatsApp initialization and polling
  useEffect(() => {
    if (activeChannel === 'whatsapp') {
      fetchWhatsAppStatus().then((data) => {
        if (!data || data.status === 'disconnected') {
          handleConnectWhatsApp();
        }
      });

      const interval = setInterval(async () => {
        const data = await fetchWhatsAppStatus();
        if (data?.status === 'connected') {
          loadConversations('whatsapp');
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activeChannel, fetchWhatsAppStatus, handleConnectWhatsApp, loadConversations]);

  // Email status and auto sync on active
  useEffect(() => {
    if (activeChannel === 'email') {
      conversationService.getEmailStatus().then((res) => {
        if (res?.data?.data) setEmailStatus(res.data.data);
      });
      conversationService.syncEmails().then(() => {
        loadConversations('email');
      });
    }
  }, [activeChannel, loadConversations]);

  // Messenger status on active
  useEffect(() => {
    if (activeChannel === 'messenger') {
      conversationService.getMessengerStatus().then((res) => {
        if (res?.data?.data) setMessengerStatus(res.data.data);
      }).catch(() => { });
    }
  }, [activeChannel]);

  // Scope conversations for staff users
  const scopedConversations = useMemo(() => {
    if (isSuperAdmin) return conversations;
    return conversations.filter((c) => {
      const isAssignedStaff = Number(c.assigned_staff_id) === Number(user?.user_id);
      const isOppAssigned = c.opportunity && Number(c.opportunity.assigned_staff_id) === Number(user?.user_id);
      return isAssignedStaff || isOppAssigned;
    });
  }, [conversations, isSuperAdmin, user?.user_id]);

  // Categorize conversations for Email filters
  const allEmailConversations = useMemo(() => {
    if (activeChannel !== 'email') return scopedConversations;
    return scopedConversations;
  }, [scopedConversations, activeChannel]);

  const receivedConversations = useMemo(() => {
    if (activeChannel !== 'email') return scopedConversations;
    return scopedConversations.filter((conv) => {
      if (Array.isArray(conv.messages) && conv.messages.length > 0) {
        return conv.messages.some((m) => m.sender_type === 'client');
      }
      return true; // Default fallback for inbound email threads
    });
  }, [scopedConversations, activeChannel]);

  const sentConversations = useMemo(() => {
    if (activeChannel !== 'email') return scopedConversations;
    return scopedConversations.filter((conv) => {
      if (Array.isArray(conv.messages) && conv.messages.length > 0) {
        return conv.messages.some((m) => m.sender_type === 'staff');
      }
      return false;
    });
  }, [scopedConversations, activeChannel]);

  const starredConversations = useMemo(() => {
    if (activeChannel !== 'email') return scopedConversations;
    return scopedConversations.filter((conv) => {
      // Check if conversation messages or starred list includes this conversation
      return starredEmails.some((item) => String(item.conversationId) === String(conv.conversation_id));
    });
  }, [scopedConversations, activeChannel, starredEmails]);

  const displayedConversations = useMemo(() => {
    if (activeChannel !== 'email') return scopedConversations;
    if (emailFolder === 'sent') return sentConversations;
    if (emailFolder === 'received') return receivedConversations;
    if (emailFolder === 'starred') return starredConversations;
    if (emailFolder === 'inbox') return allEmailConversations;
    return scopedConversations;
  }, [activeChannel, emailFolder, scopedConversations, sentConversations, receivedConversations, starredConversations, allEmailConversations]);

  const counts = useMemo(() => ({
    current: activeChannel === 'email'
      ? (emailFolder === 'sent'
        ? sentConversations.length
        : emailFolder === 'received'
          ? receivedConversations.length
          : emailFolder === 'starred'
            ? starredConversations.length
            : allEmailConversations.length)
      : scopedConversations.length,
    inbox: allEmailConversations.length,
    received: receivedConversations.length,
    sent: sentConversations.length,
    starred: starredConversations.length,
    draft: draftsList.length,
  }), [activeChannel, emailFolder, scopedConversations.length, allEmailConversations.length, receivedConversations.length, sentConversations.length, starredConversations.length, draftsList.length]);

  const handleSelectEmailFolder = (folder) => {
    setEmailFolder(folder);
    setShowFullThreadInSent(false);
    if (folder === 'inbox') {
      if (!allEmailConversations.some((c) => c.conversation_id === selected?.conversation_id)) {
        setSelected(allEmailConversations[0] || null);
      }
    } else if (folder === 'received') {
      if (!receivedConversations.some((c) => c.conversation_id === selected?.conversation_id)) {
        setSelected(receivedConversations[0] || null);
      }
    } else if (folder === 'sent') {
      if (!sentConversations.some((c) => c.conversation_id === selected?.conversation_id)) {
        setSelected(sentConversations[0] || null);
      }
    } else if (folder === 'starred') {
      if (!starredConversations.some((c) => c.conversation_id === selected?.conversation_id)) {
        setSelected(starredConversations[0] || null);
      }
    }
  };

  // Filter messages displayed in email thread view based on active email folder
  const emailThreadMessages = useMemo(() => {
    if (activeChannel !== 'email') return messages;
    if (emailFolder === 'received') {
      // In Received folder: only view received emails (sender_type === 'client')
      return messages.filter((m) => m.sender_type === 'client');
    }
    if (emailFolder === 'sent' && !showFullThreadInSent) {
      // In Sent folder: show staff sent emails
      return messages.filter((m) => m.sender_type === 'staff');
    }
    if (emailFolder === 'starred') {
      // In Starred folder: show only starred/saved emails
      return messages.filter((m) => starredEmails.some((s) => s.messageId === m.message_id));
    }
    // In Inbox folder: show all sent and received emails in thread
    return messages;
  }, [activeChannel, emailFolder, messages, showFullThreadInSent, starredEmails]);

  // Email folder definitions with metadata and counts for dropdown
  const emailFolders = useMemo(() => [
    {
      id: 'inbox',
      label: 'Inbox',
      subtitle: 'All sent & received emails',
      icon: Inbox,
      iconColor: 'text-blue-600',
      count: allEmailConversations.length,
    },
    {
      id: 'received',
      label: 'Received',
      subtitle: 'Only student received emails',
      icon: Mail,
      iconColor: 'text-emerald-600',
      count: receivedConversations.length,
    },
    {
      id: 'sent',
      label: 'Sent',
      subtitle: 'Staff sent emails',
      icon: Send,
      iconColor: 'text-slate-600',
      count: sentConversations.length,
    },
    {
      id: 'starred',
      label: 'Starred',
      subtitle: 'Saved favorites list',
      icon: Star,
      iconColor: 'text-amber-500 fill-amber-400',
      count: starredConversations.length,
    },
    {
      id: 'draft',
      label: 'Draft',
      subtitle: 'Saved email drafts',
      icon: FileText,
      iconColor: 'text-slate-600',
      count: draftsList.length,
    },
  ], [allEmailConversations.length, receivedConversations.length, sentConversations.length, starredConversations.length, draftsList.length]);

  const currentFolder = useMemo(() => {
    return emailFolders.find((f) => f.id === emailFolder) || emailFolders[0];
  }, [emailFolders, emailFolder]);

  // Send message via Chat Bubble bar (WhatsApp / Messenger / Quick Email)
  const send = async (event) => {
    event?.preventDefault();
    if (!selected || (!draft.trim() && !attachment) || sending) return;
    setSending(true);
    setError('');
    try {
      let mediaUrl;
      let messageType = 'text';
      if (attachment) {
        const uploadResponse = await conversationService.uploadMedia(attachment);
        mediaUrl = uploadResponse?.data?.data?.media_url;
        messageType = attachment.type.startsWith('image/')
          ? 'image'
          : attachment.type.startsWith('video/')
            ? 'video'
            : attachment.type.startsWith('audio/')
              ? 'audio'
              : 'document';
      }

      let finalContent = draft.trim();
      if (replyingTo) {
        const quotedSender = replyingTo.sender_type === 'staff' ? 'You' : (selected.clients?.name || selected.channel_client_id || 'User');
        const parsedReplied = parseMessageContent(replyingTo.content);
        const quotedText = (parsedReplied.body || '').replace(/\n/g, ' ').substring(0, 80);
        finalContent = `[Reply: ${quotedSender}: ${quotedText}]\n\n${finalContent}`;
      }

      await conversationService.sendMessage(selected.conversation_id, {
        content: finalContent,
        media_url: mediaUrl,
        media_source: 'system_storage',
        message_type: messageType,
      });
      setDraft('');
      setAttachment(null);
      setReplyingTo(null);
      await loadMessages(selected);
      await loadConversations(activeChannel);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  };

  // Handler for Gmail Compose Popup Send
  const handleComposeSend = async ({ conversationId, to, cc, bcc, subject, content, attachment }) => {
    let mediaUrl;
    let messageType = 'text';
    if (attachment) {
      const uploadResponse = await conversationService.uploadMedia(attachment);
      mediaUrl = uploadResponse?.data?.data?.media_url;
      messageType = attachment.type.startsWith('image/') ? 'image' : 'document';
    }

    const convId = conversationId || selected?.conversation_id || 'new';

    await conversationService.sendMessage(convId, {
      to,
      cc,
      bcc,
      subject,
      content,
      media_url: mediaUrl,
      media_source: 'system_storage',
      message_type: messageType,
    });

    if (selected?.conversation_id && selected.conversation_id === convId) {
      await loadMessages(selected);
    }
    await loadConversations('email');
    // Switch to sent folder so user can see their sent email immediately
    setEmailFolder('sent');
  };

  const handleOpenComposeNew = () => {
    setComposeInitial({
      to: '',
      subject: '',
      body: '',
      conversationId: selected?.channel === 'email' ? selected.conversation_id : null,
    });
    setIsComposeOpen(true);
  };

  const handleReply = ({ to, subject }) => {
    const replySubject = subject?.startsWith('Re:') ? subject : `Re: ${subject || ''}`;
    setComposeInitial({
      to: to || selected?.channel_client_id || '',
      subject: replySubject,
      body: '\n\n--- On previous email ---',
      conversationId: selected?.conversation_id || null,
    });
    setIsComposeOpen(true);
  };

  const handleForward = ({ subject, content }) => {
    const fwdSubject = subject?.startsWith('Fwd:') ? subject : `Fwd: ${subject || ''}`;
    setComposeInitial({
      to: '',
      subject: fwdSubject,
      body: `\n\n---------- Forwarded message ---------\n${content || ''}`,
      conversationId: selected?.conversation_id || null,
    });
    setIsComposeOpen(true);
  };

  const handleOpenDraft = (draftItem, index) => {
    setComposeInitial({
      to: draftItem.to || '',
      subject: draftItem.subject || '',
      body: draftItem.body || '',
      conversationId: selected?.conversation_id || null,
    });
    deleteDraftItem(index);
    setIsComposeOpen(true);
  };

  // Find latest thread subject for Email
  const threadSubject = useMemo(() => {
    if (activeChannel !== 'email') return '';
    for (const msg of messages) {
      const parsed = parseEmailContent(msg.content);
      if (parsed.subject) return parsed.subject;
    }
    return selected?.clients?.name ? `Inquiry from ${selected.clients.name}` : '(No Subject)';
  }, [activeChannel, messages, selected]);

  const config = channelConfig[activeChannel];
  const isSupportedChannel = activeChannel === 'messenger' || activeChannel === 'whatsapp' || activeChannel === 'email';
  const isWhatsApp = activeChannel === 'whatsapp';
  const isEmail = activeChannel === 'email';
  const isWhatsAppConnected = isWhatsApp && waStatus === 'connected';

  const badgeBgClass = isWhatsApp
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isEmail
      ? 'bg-violet-50 text-violet-700 border-violet-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';

  const clientDisplayName = selected?.clients?.name ||
    (isWhatsApp && selected?.channel_client_id ? `+${selected.channel_client_id}` : (selected?.channel_client_id || (isWhatsApp ? 'WhatsApp User' : isEmail ? 'Email Contact' : 'Facebook user')));

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-4">
      {/* Top Header Bar */}
      <header className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Conversations</h1>

            {isWhatsAppConnected && waPhoneNumber && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Linked: +{waPhoneNumber}
              </span>
            )}
            {isEmail && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Gmail: {emailStatus.email || 'messiorasolutions@gmail.com'}
              </span>
            )}
            {activeChannel === 'messenger' && messengerStatus.connected && messengerStatus.pageName && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Page: {messengerStatus.pageName}
              </span>
            )}
            {activeChannel === 'messenger' && messengerStatus.configured && !messengerStatus.connected && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs" title={messengerStatus.error || 'Token expired'}>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Token Expired / Reconnect Needed
              </span>
            )}
            {activeChannel === 'messenger' && !messengerStatus.configured && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                Setup Required
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Manage incoming {config.label} conversations from one workspace.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {isWhatsAppConnected && (
            <button
              type="button"
              onClick={handleDisconnectWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-rose-600 text-xs font-semibold hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer shadow-2xs"
              title="Unlink Phone"
            >
              Unlink Device
            </button>
          )}
          {isEmail && (
            <>
              <button
                type="button"
                onClick={handleSyncEmails}
                disabled={emailSyncing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
                title="Sync New Emails"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${emailSyncing ? 'animate-spin text-blue-600' : ''}`} />
                <span>{emailSyncing ? 'Syncing...' : 'Sync Emails'}</span>
              </button>
              <button
                type="button"
                onClick={handleOpenComposeNew}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs shrink-0"
                title="Compose New Email"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Compose Email</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => loadConversations(activeChannel)}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>
        </div>
      </header>

      {/* Channel Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(channelConfig).map(([id, item]) => {
          const isActive = activeChannel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveChannel(id);
                setSelected(null);
              }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition cursor-pointer shadow-2xs ${isActive
                ? item.activeClass
                : 'border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900'
                }`}
            >
              {renderChannelIcon(id)}
              <span>{item.label}</span>
              {isActive && (
                <span className="text-[11px] opacity-80 font-bold">({counts.current})</span>
              )}
            </button>
          );
        })}
      </div>

      {successBanner && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCheck className="h-4 w-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button type="button" onClick={() => setSuccessBanner('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {activeChannel === 'messenger' && messengerStatus.configured && !messengerStatus.connected && (
        <div className="flex items-start justify-between rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 shadow-2xs">
          <div className="flex gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-amber-950">Facebook Messenger Needs Reconnection (Access Token Expired)</p>
              <p className="mt-0.5 text-amber-800">
                {messengerStatus.error || 'The Facebook Page Access Token configured in backend/.env has expired or was revoked by Facebook.'}
              </p>
              <p className="mt-1 font-medium text-amber-700">
                To fix: Open Meta for Developers &rarr; Graph API Explorer / Page Access Tokens, generate a fresh Page Access Token, and set <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-900 font-mono">FACEBOOK_PAGE_ACCESS_TOKEN</code> in <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-900 font-mono">backend/.env</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-2.5 text-xs font-semibold text-rose-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError('')} className="p-1 hover:bg-rose-100 rounded text-rose-600 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!isSupportedChannel ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <MessageCircle className="mb-3 h-10 w-10 text-slate-300" />
          <h2 className="font-semibold text-slate-800">{config.label} is ready for integration</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Messenger, WhatsApp, and Email are active in this workspace.
          </p>
        </div>
      ) : isWhatsApp && !isWhatsAppConnected ? (
        /* WhatsApp Linked Device QR Code Connection Screen */
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
            <QrCode className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Connect WhatsApp Business</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Scan this QR code using your WhatsApp Business mobile app to link your company number directly to Edugate CRM without Meta verification.
          </p>

          <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 flex flex-col items-center justify-center">
            {waQrCode ? (
              <div className="flex flex-col items-center">
                <img
                  src={waQrCode}
                  alt="WhatsApp QR Code"
                  className="h-64 w-64 rounded-xl border border-slate-300 bg-white p-2 shadow-sm"
                />
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Point your WhatsApp camera at this code
                </div>
              </div>
            ) : (
              <div className="flex h-64 w-64 flex-col items-center justify-center gap-3">
                <LoaderCircle className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-xs text-slate-500">Generating secure QR code...</p>
              </div>
            )}
          </div>

          <div className="grid max-w-xl grid-cols-1 gap-3 text-left text-xs sm:grid-cols-3 mb-6">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="font-bold text-slate-900 block mb-1">1. Open WhatsApp</span>
              <p className="text-slate-500">Open WhatsApp Business on your phone.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="font-bold text-slate-900 block mb-1">2. Linked Devices</span>
              <p className="text-slate-500">Tap Settings (or ⋮ on Android) &gt; Linked Devices.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="font-bold text-slate-900 block mb-1">3. Scan QR Code</span>
              <p className="text-slate-500">Tap "Link a device" and point your camera here.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectWhatsApp}
            disabled={waConnecting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${waConnecting ? 'animate-spin' : ''}`} />
            Refresh QR Code
          </button>
        </div>
      ) : (
        /* Main Workspace: Left Sidebar + Right Conversation Pane */
        <main className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs lg:grid-cols-[330px_minmax(0,1fr)]">
          {/* Left Sidebar */}
          <aside className="flex flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
            {/* Search Input Bar */}
            <div className="border-b border-slate-100 p-3 space-y-2.5">
              <div className="relative w-full group">
                <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${config.label} messages...`}
                  className="w-full pl-9 pr-8 py-2 border border-blue-200/80 bg-white rounded-xl text-xs font-medium text-slate-700 placeholder:text-slate-400 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-xs"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-md transition-all cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Email Filter Dropdown Selector */}
              {isEmail && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFolderDropdownOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-400 rounded-xl text-xs font-semibold text-slate-800 transition cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {currentFolder.label}
                      </span>
                      <span className="rounded-full bg-slate-200/80 px-2 py-0.2 text-[10px] font-bold text-slate-700">
                        {currentFolder.count}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-xs shrink-0">
                      <span className="text-[11px] font-semibold text-slate-600">Filter</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${isFolderDropdownOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'
                          }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown Menu Modal */}
                  {isFolderDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsFolderDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden py-1 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        {emailFolders.map((folder) => {
                          const isSelected = emailFolder === folder.id;
                          return (
                            <button
                              key={folder.id}
                              type="button"
                              onClick={() => {
                                handleSelectEmailFolder(folder.id);
                                setIsFolderDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition cursor-pointer ${isSelected ? 'bg-blue-50/70 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{folder.label}</span>
                                  {isSelected && (
                                    <span className="rounded-md bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-800 uppercase tracking-wider">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {folder.subtitle}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                  {folder.count}
                                </span>
                                {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Conversation List / Drafts List */}
            <div className="flex-1 overflow-y-auto max-h-[34rem]">
              {loading ? (
                <div className="flex justify-center p-8">
                  <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              ) : isEmail && emailFolder === 'draft' ? (
                /* Saved Drafts View */
                draftsList.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <p className="font-semibold text-slate-700">No Drafts</p>
                    <p className="mt-1 text-xs text-slate-400">Compose an email and save it as a draft.</p>
                    <button
                      type="button"
                      onClick={handleOpenComposeNew}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 px-3 py-1.5 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 shadow-2xs transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 text-blue-600" />
                      <span>New Draft</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {draftsList.map((d, index) => (
                      <div
                        key={index}
                        className="group flex items-start justify-between p-3.5 hover:bg-slate-50 transition cursor-pointer"
                        onClick={() => handleOpenDraft(d, index)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800">
                            {d.to || '(No Recipient)'}
                          </p>
                          <p className="truncate text-xs font-semibold text-slate-700">
                            {d.subject || '(Draft No Subject)'}
                          </p>
                          <p className="truncate text-[11px] text-slate-500 mt-0.5">
                            {d.body || '(Empty body)'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDraftItem(index);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                          title="Delete draft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <ConversationList
                  conversations={displayedConversations}
                  selectedId={selected?.conversation_id}
                  onSelect={setSelected}
                  search={search}
                  channel={activeChannel}
                  emailFolder={emailFolder}
                />
              )}
            </div>
          </aside>

          {/* Right Pane: Conversation Details */}
          <section className="flex min-h-[34rem] min-w-0 flex-1 flex-col overflow-hidden bg-white">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                {isEmail ? (
                  <Mail className="mb-3 h-12 w-12 text-slate-200" />
                ) : (
                  <MessageCircle className="mb-3 h-12 w-12 text-slate-200" />
                )}
                <p className="font-semibold text-slate-700">Select a conversation</p>
                <p className="mt-1 text-xs text-slate-400">
                  Incoming {config.label} messages will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="border-b border-slate-100 p-4 bg-white">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs font-bold text-xs">
                        {isEmail ? (
                          <Mail className="h-5 w-5 text-slate-600" />
                        ) : isWhatsApp ? (
                          renderChannelIcon('whatsapp', 'h-5 w-5')
                        ) : (
                          renderChannelIcon('messenger', 'h-5 w-5')
                        )}
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="truncate font-bold text-slate-900 text-sm sm:text-base">
                            {clientDisplayName}
                          </h2>
                          {isEmail && (
                            <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                              {emailFolder === 'sent' ? 'Sent' : emailFolder === 'received' ? 'Received' : emailFolder === 'starred' ? 'Starred' : 'Inbox'}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          {isWhatsApp ? (
                            <span>WhatsApp · +{selected.channel_client_id}</span>
                          ) : isEmail ? (
                            <span>Email · {selected.channel_client_id}{threadSubject ? ` · ${threadSubject}` : ''}</span>
                          ) : (
                            <>
                              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active on Facebook Messenger</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {selected?.has_opportunity || selected?.opportunity ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Already Added to Opportunity</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsOpportunityModalOpen(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
                          title="Add Opportunity from this contact"
                        >
                          <Target className="w-3.5 h-3.5 text-slate-600" />
                          <span>Add Opportunity</span>
                        </button>
                      )}

                      {isEmail && (
                        <button
                          type="button"
                          onClick={() => handleReply({ to: selected.channel_client_id, subject: threadSubject })}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs shrink-0"
                          title="Open Email Composer"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>Compose / Reply</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Body Area */}
                <div className="flex-1 min-w-0 space-y-4 overflow-y-auto overflow-x-hidden bg-slate-50/50 p-4">
                  {messagesLoading ? (
                    <div className="flex justify-center p-8">
                      <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400">
                      <Mail className="mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-xs">No messages in this thread yet.</p>
                    </div>
                  ) : isEmail ? (
                    /* Email Layout */
                    <div className="space-y-4 min-w-0 max-w-full">
                      {/* Sent Folder toggle banner if full thread has client messages too */}
                      {emailFolder === 'sent' && messages.some((m) => m.sender_type === 'client') && (
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-700 shadow-2xs">
                          <span>
                            {showFullThreadInSent
                              ? `Viewing full thread (${messages.length} total messages)`
                              : `Showing sent emails only (${messages.filter((m) => m.sender_type === 'staff').length})`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowFullThreadInSent((prev) => !prev)}
                            className="font-semibold underline hover:text-slate-900 transition cursor-pointer"
                          >
                            {showFullThreadInSent ? 'Show sent only' : 'View full thread with replies'}
                          </button>
                        </div>
                      )}

                      {emailThreadMessages.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center p-8 text-center text-slate-400">
                          <Mail className="mb-2 h-8 w-8 text-slate-300" />
                          <p className="text-xs">
                            {emailFolder === 'received'
                              ? 'No received emails in this thread.'
                              : emailFolder === 'sent'
                                ? 'No sent emails in this thread.'
                                : emailFolder === 'starred'
                                  ? 'No starred emails in this thread.'
                                  : 'No messages in this thread yet.'}
                          </p>
                        </div>
                      ) : (
                        emailThreadMessages.map((message) => {
                          const isStaff = message.sender_type === 'staff';
                          const parsed = parseEmailContent(message.content);
                          const senderName = isStaff ? 'Edugate Global CRM' : (selected.clients?.name || selected.channel_client_id);
                          const senderEmail = isStaff ? emailStatus.email : selected.channel_client_id;
                          const recipientName = isStaff ? (selected.clients?.name || selected.channel_client_id) : 'Edugate Global CRM';
                          const recipientEmail = isStaff ? selected.channel_client_id : emailStatus.email;
                          const isStarred = starredEmails.some((item) => item.messageId === message.message_id);
                          const isDetailsOpen = openDetailsMessageId === message.message_id;

                          return (
                            <div
                              key={message.message_id}
                              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition hover:border-slate-300 min-w-0 max-w-full overflow-hidden"
                            >
                              {/* Email Sender Row */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs text-white shadow-2xs ${isStaff ? 'bg-slate-800' : 'bg-blue-800'
                                    }`}>
                                    {senderName[0]?.toUpperCase() || 'E'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="text-xs font-bold text-slate-900 truncate">{senderName}</span>
                                      <span className="text-xs text-slate-500 truncate">&lt;{senderEmail}&gt;</span>
                                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${isStaff ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                                        }`}>
                                        {isStaff ? 'Sent' : 'Received'}
                                      </span>
                                    </div>
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => setOpenDetailsMessageId(isDetailsOpen ? null : message.message_id)}
                                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mt-0.5 cursor-pointer hover:underline transition"
                                        title="Click to view details"
                                      >
                                        <span>to {isStaff ? selected.channel_client_id : 'me'}</span>
                                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isDetailsOpen ? 'rotate-180 text-blue-600' : ''}`} />
                                      </button>

                                      {isDetailsOpen && (
                                        <div className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50/95 p-3.5 text-xs text-slate-700 shadow-sm space-y-2 max-w-md">
                                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
                                            <span className="font-bold text-slate-900">Email Details</span>
                                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isStaff ? 'bg-slate-200/80 text-slate-800' : 'bg-blue-100 text-blue-900'
                                              }`}>
                                              {isStaff ? 'Sent Email' : 'Received Email'}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-[72px_1fr] gap-1.5 items-baseline">
                                            <span className="font-semibold text-slate-500">From:</span>
                                            <span className="font-medium text-slate-900 break-all">{senderName} &lt;{senderEmail}&gt;</span>
                                          </div>
                                          <div className="grid grid-cols-[72px_1fr] gap-1.5 items-baseline">
                                            <span className="font-semibold text-slate-500">To:</span>
                                            <span className="font-medium text-slate-900 break-all">{recipientName} &lt;{recipientEmail}&gt;</span>
                                          </div>
                                          <div className="grid grid-cols-[72px_1fr] gap-1.5 items-baseline">
                                            <span className="font-semibold text-slate-500">Date & Time:</span>
                                            <span className="text-slate-800 font-medium">{formatEmailDate(message.created_at)}</span>
                                          </div>
                                          <div className="grid grid-cols-[72px_1fr] gap-1.5 items-baseline">
                                            <span className="font-semibold text-slate-500">Subject:</span>
                                            <span className="text-slate-800 font-medium">{parsed.subject || threadSubject || '(No Subject)'}</span>
                                          </div>
                                          <div className="grid grid-cols-[72px_1fr] gap-1.5 items-baseline">
                                            <span className="font-semibold text-slate-500">Direction:</span>
                                            <span className="text-slate-800">
                                              {isStaff ? 'Sent (Staff to Student)' : 'Received (Student to Edugate CRM)'}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                                  <time>{formatEmailDate(message.created_at)}</time>
                                  <button
                                    type="button"
                                    onClick={() => toggleStarMessage(message)}
                                    className={`transition cursor-pointer text-xs ${isStarred
                                      ? 'px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 shadow-2xs'
                                      : 'p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md'
                                      }`}
                                    title={isStarred ? 'Click to remove from saved list' : 'Add to saved list'}
                                  >
                                    {isStarred ? (
                                      <span className="text-[11px] font-semibold text-black">
                                        Already added to saved list
                                      </span>
                                    ) : (
                                      <Star className="h-4 w-4" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReply({ to: senderEmail, subject: parsed.subject || threadSubject })}
                                    className="p-1 hover:text-slate-800 rounded cursor-pointer"
                                    title="Reply"
                                  >
                                    <Reply className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Email Message Content */}
                              <div className="mt-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap break-words [word-break:break-word] overflow-x-auto max-h-[500px] overflow-y-auto">
                                {parsed.body || '(No text content)'}
                              </div>

                              {/* Downloadable Attachment Preview */}
                              {message.media_url && (
                                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 max-w-md shadow-2xs">
                                  <div className="flex items-center gap-3 truncate">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="truncate">
                                      <p className="truncate text-xs font-semibold text-slate-800">
                                        {message.media_url.split('/').pop() || 'Email Attachment'}
                                      </p>
                                      <span className="text-[10px] text-slate-400">Downloadable attachment</span>
                                    </div>
                                  </div>
                                  <a
                                    href={message.media_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}

                      {/* Bottom Quick Reply & Forward Buttons */}
                      <div className="flex items-center gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => handleReply({ to: selected.channel_client_id, subject: threadSubject })}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
                        >
                          <Reply className="w-3.5 h-3.5 text-slate-600" />
                          <span>Reply</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForward({ subject: threadSubject, content: messages[messages.length - 1]?.content })}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
                        >
                          <Forward className="w-3.5 h-3.5 text-slate-600" />
                          <span>Forward</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* WhatsApp & Messenger Bubble Chat View */
                    <div className="space-y-3 p-2">
                      {messages.map((message) => {
                        const isStaff = message.sender_type === 'staff';
                        const rawContent = message.content || '';
                        const parsed = parseMessageContent(rawContent);
                        const isThumbsUpOnly = parsed.body.trim() === '👍';
                        const clientName = selected.clients?.name || selected.channel_client_id || 'User';
                        const senderInitial = isStaff ? 'E' : (clientName[0]?.toUpperCase() || 'U');
                        const reactions = messageReactions[message.message_id] || [];
                        const isReactionPickerOpen = activeReactionPickerId === message.message_id;

                        return (
                          <div
                            key={message.message_id}
                            className={`group relative flex items-end gap-2 ${isStaff ? 'justify-end' : 'justify-start'
                              }`}
                          >
                            {/* Inbound Customer Avatar */}
                            {!isStaff && (
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] select-none mb-1 shadow-2xs"
                                title={clientName}
                              >
                                {senderInitial}
                              </div>
                            )}

                            {/* Floating Action Bar on Hover (For Staff on left, For Client on right) */}
                            {isStaff && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-2xs rounded-full p-0.5 mr-1 self-center relative z-20">
                                <button
                                  type="button"
                                  onClick={() => setReplyingTo(message)}
                                  className="p-1 text-slate-500 hover:text-[#0084ff] hover:bg-slate-100 rounded-full transition cursor-pointer"
                                  title="Reply to message"
                                >
                                  <Reply className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveReactionPickerId(isReactionPickerOpen ? null : message.message_id)}
                                  className="p-1 text-slate-500 hover:text-amber-500 hover:bg-slate-100 rounded-full transition cursor-pointer"
                                  title="React with emoji"
                                >
                                  <Smile className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Message Bubble Container */}
                            <div className="relative max-w-[80%] sm:max-w-[70%]">
                              {/* Messenger Reaction Picker Popover */}
                              {isReactionPickerOpen && (
                                <div
                                  className={`absolute -top-11 ${isStaff ? 'right-0' : 'left-0'
                                    } z-30 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-full shadow-lg border border-slate-200 animate-in zoom-in-95 duration-150`}
                                >
                                  {MESSENGER_REACTIONS.map((r) => {
                                    const hasSelected = reactions.includes(r.emoji);
                                    return (
                                      <button
                                        key={r.emoji}
                                        type="button"
                                        onClick={() => handleToggleReaction(message.message_id, r.emoji)}
                                        className={`text-base hover:scale-130 transition-transform cursor-pointer p-0.5 ${hasSelected ? 'scale-110 drop-shadow-xs' : ''
                                          }`}
                                        title={r.label}
                                      >
                                        {r.emoji}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Quoted Reply Preview inside bubble */}
                              {parsed.replyQuote && (
                                <div
                                  className={`mb-1 flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] border-l-2 ${isStaff
                                    ? 'bg-blue-600/60 text-blue-100 border-white/60'
                                    : 'bg-slate-200/90 text-slate-700 border-slate-400'
                                    }`}
                                >
                                  <Reply className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    <strong>{parsed.replyQuote.sender}:</strong> {parsed.replyQuote.text}
                                  </span>
                                </div>
                              )}

                              {/* Message Content: Thumbs Up or Normal Text Bubble */}
                              {isThumbsUpOnly ? (
                                <div className="py-1 px-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleReaction(message.message_id, '👍')}
                                    className="hover:scale-115 active:scale-95 transition-transform cursor-pointer block"
                                    title="Thumbs up"
                                  >
                                    <ThumbsUp className="h-10 w-10 text-[#0084ff] fill-[#0084ff] drop-shadow-xs" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  className={`px-3.5 py-2 text-[13px] leading-relaxed shadow-2xs ${isStaff
                                    ? 'rounded-[18px] rounded-br-[4px] bg-[#0084ff] text-white'
                                    : 'rounded-[18px] rounded-bl-[4px] bg-[#f0f2f5] text-[#050505]'
                                    }`}
                                >
                                  {parsed.body && (
                                    <p className="whitespace-pre-wrap break-words">
                                      {parsed.body}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Downloadable Media Attachment */}
                              {message.media_url && (
                                <div
                                  className={`mt-1.5 flex items-center justify-between gap-3 rounded-xl p-2.5 text-xs ${isStaff
                                    ? 'bg-blue-600/70 text-white'
                                    : 'bg-slate-200/80 text-slate-800'
                                    }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 shrink-0" />
                                    <span className="truncate font-medium">Attachment</span>
                                  </div>
                                  <a
                                    href={message.media_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-xs hover:bg-slate-100 transition"
                                  >
                                    <Download className="h-3 w-3" />
                                    <span>Download</span>
                                  </a>
                                </div>
                              )}

                              {/* Attached Reactions Badge overlapping bubble */}
                              {reactions.length > 0 && (
                                <div
                                  onClick={() => setActiveReactionPickerId(isReactionPickerOpen ? null : message.message_id)}
                                  className={`absolute -bottom-2 ${isStaff ? 'right-2' : 'left-2'
                                    } z-10 flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 shadow-xs text-xs cursor-pointer hover:scale-105 transition`}
                                  title="Reactions"
                                >
                                  {reactions.map((emoji, idx) => (
                                    <span key={idx} className="text-xs">{emoji}</span>
                                  ))}
                                  {reactions.length > 1 && (
                                    <span className="text-[10px] font-bold text-slate-500 ml-0.5">{reactions.length}</span>
                                  )}
                                </div>
                              )}

                              {/* Time & Delivery Check */}
                              <div
                                className={`mt-1 flex items-center gap-1 text-[10px] text-slate-400 ${isStaff ? 'justify-end pr-1' : 'justify-start pl-1'
                                  }`}
                              >
                                <span>
                                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isStaff && <CheckCheck className="h-3 w-3 text-[#0084ff]" />}
                              </div>
                            </div>

                            {/* Floating Action Bar on Hover (For Client on right) */}
                            {!isStaff && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-2xs rounded-full p-0.5 ml-1 self-center relative z-20">
                                <button
                                  type="button"
                                  onClick={() => setActiveReactionPickerId(isReactionPickerOpen ? null : message.message_id)}
                                  className="p-1 text-slate-500 hover:text-amber-500 hover:bg-slate-100 rounded-full transition cursor-pointer"
                                  title="React with emoji"
                                >
                                  <Smile className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReplyingTo(message)}
                                  className="p-1 text-slate-500 hover:text-[#0084ff] hover:bg-slate-100 rounded-full transition cursor-pointer"
                                  title="Reply to message"
                                >
                                  <Reply className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div ref={messagesEnd} />
                </div>

                {/* Bottom Messenger Reply & Action Bar */}
                {!isEmail && (
                  <div className="border-t border-slate-200/90 bg-white">
                    {/* Replying Banner Preview */}
                    {replyingTo && (
                      <div className="flex items-center justify-between border-b border-slate-200/70 bg-[#f0f2f5] px-4 py-2 text-xs animate-in slide-in-from-bottom-2 duration-150">
                        <div className="flex items-center gap-2 truncate">
                          <Reply className="h-3.5 w-3.5 text-[#0084ff] shrink-0" />
                          <span className="text-slate-500">
                            Replying to <strong className="text-slate-900">{replyingTo.sender_type === 'staff' ? 'yourself' : (selected.clients?.name || selected.channel_client_id)}</strong>:
                          </span>
                          <span className="truncate italic text-slate-600 max-w-xs">
                            “{parseMessageContent(replyingTo.content).body.replace(/\n/g, ' ').substring(0, 50)}”
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
                          title="Cancel reply"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Attachment preview banner */}
                    {attachment && (
                      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-700">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="truncate font-medium">{attachment.name}</span>
                          <span className="text-slate-400">({(attachment.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachment(null)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Authentic Messenger Input Container */}
                    <form onSubmit={send} className="flex items-center gap-2 px-3 py-2.5">
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                        hidden
                        onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                      />

                      {/* Attach Photo / Media */}
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#0084ff] hover:bg-blue-50 transition cursor-pointer shrink-0"
                        title="Attach photos or files"
                      >
                        <ImagePlus className="h-5 w-5" />
                      </button>

                      {/* Insert Smile / Emoji */}
                      <button
                        type="button"
                        onClick={() => setDraft((prev) => prev + '😊')}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#0084ff] hover:bg-blue-50 transition cursor-pointer shrink-0"
                        title="Insert emoji"
                      >
                        <Smile className="h-5 w-5" />
                      </button>

                      {/* Pill Input Box */}
                      <div className="flex-1 flex items-center rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 border border-transparent px-4 py-1.5 transition">
                        <input
                          type="text"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              send(e);
                            }
                          }}
                          placeholder={activeChannel === 'messenger' ? 'Aa' : `Write a ${config.label} reply...`}
                          className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {/* Dynamic Send vs Thumbs Up Button */}
                      {draft.trim() || attachment ? (
                        <button
                          type="submit"
                          disabled={sending}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0084ff] hover:bg-[#0073e6] text-white shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
                          title="Send message"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={sendThumbsUp}
                          disabled={sending}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[#0084ff] hover:bg-blue-50 hover:scale-115 active:scale-90 transition cursor-pointer shrink-0 disabled:opacity-50"
                          title="Send a thumbs up 👍"
                        >
                          <ThumbsUp className="h-5 w-5 fill-[#0084ff]" />
                        </button>
                      )}
                    </form>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      )}

      {/* Gmail-Style Compose Popup Modal */}
      <EmailComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleComposeSend}
        onSaveDraft={saveDraftItem}
        initialTo={composeInitial.to}
        initialSubject={composeInitial.subject}
        initialBody={composeInitial.body}
        conversationId={composeInitial.conversationId}
      />

      {/* Add Opportunity Modal */}
      <AddOpportunityModal
        isOpen={isOpportunityModalOpen}
        onClose={() => setIsOpportunityModalOpen(false)}
        conversation={selected}
        activeChannel={activeChannel}
        onSuccess={(msg, oppData) => {
          setSuccessBanner(msg);
          setSelected((prev) => (prev ? { ...prev, has_opportunity: true, opportunity: oppData?.opportunity || true } : prev));
          loadConversations(activeChannel);
        }}
      />
    </div>
  );
}
