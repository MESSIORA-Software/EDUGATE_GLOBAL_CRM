import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCheck, CheckCircle2, ChevronDown, Download, FileText, Forward, ImagePlus, Inbox,
  LoaderCircle, Mail, Maximize2, MessageCircle, Minimize2, Paperclip, PhoneCall, Plus,
  QrCode, RefreshCw, Reply, Search, Send, Star, Target, Trash2, UserRound, X,
} from 'lucide-react';
import conversationService from '../../services/Conversation/conversationService';
import AddOpportunityModal from '../../components/Modals/Admin/Student/AddOpportunityModal';
import useAuth from '../../hooks/Auth/useAuth';
import { getUserRole } from '../../utils/roleUtils';

const channelConfig = {
  messenger: { label: 'Messenger', activeClass: 'border-blue-500 bg-blue-50/80 text-blue-800' },
  whatsapp: { label: 'WhatsApp', activeClass: 'border-emerald-500 bg-emerald-50/80 text-emerald-800' },
  email: { label: 'Email', activeClass: 'border-violet-500 bg-violet-50/80 text-violet-800' },
  sms: { label: 'Messages & calls', activeClass: 'border-rose-500 bg-rose-50/80 text-rose-800' },
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

function ConversationList({ conversations, selectedId, onSelect, search, channel, emailFolder }) {
  const isWhatsApp = channel === 'whatsapp';
  const isEmail = channel === 'email';
  const isSentFolder = isEmail && emailFolder === 'sent';
  const defaultLabel = isWhatsApp ? 'WhatsApp User' : isEmail ? 'Email Contact' : 'Facebook user';
  const channelLabel = isWhatsApp ? 'WhatsApp' : isEmail ? (isSentFolder ? 'sent email' : 'inbox email') : 'Messenger';

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

        const activeBg = isWhatsApp
          ? 'bg-emerald-50/70 border-r-2 border-emerald-600'
          : isEmail
          ? 'bg-violet-50/70 border-r-2 border-violet-600'
          : 'bg-blue-50 border-r-2 border-blue-600';

        const hoverBg = isWhatsApp ? 'hover:bg-emerald-50/40' : isEmail ? 'hover:bg-violet-50/40' : 'hover:bg-blue-50/60';

        const avatarColor = isWhatsApp
          ? 'bg-emerald-100 text-emerald-700'
          : isEmail
          ? isSentFolder ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
          : 'bg-blue-100 text-blue-700';

        const parsedLast = isEmail ? parseEmailContent(item.last_message) : null;
        const lastSubject = parsedLast?.subject;

        return (
          <button
            key={item.conversation_id}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full p-4 text-left transition ${isSelected ? activeBg : hoverBg}`}
          >
            <div className="flex items-start gap-3">
              <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarColor}`}>
                {isEmail ? (
                  isSentFolder ? <Send className="h-4 w-4" /> : <Mail className="h-5 w-5" />
                ) : (
                  <UserRound className="h-5 w-5" />
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
                  {lastSubject ? lastSubject : (item.status === 'open' ? (isSentFolder ? 'Sent email' : 'Open conversation') : item.status)}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Gmail-style New Message Compose Popup Modal
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
  const fileInputRef = useRef(null);

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
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      // Clear compose form completely and give as new for next time
      handleClearForm();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`fixed z-50 bg-white shadow-2xl border border-slate-300 transition-all duration-200 flex flex-col ${
        isMaximized
          ? 'inset-6 rounded-2xl'
          : isMinimized
          ? 'bottom-0 right-6 w-80 rounded-t-xl'
          : 'bottom-0 right-6 w-[580px] max-w-[90vw] h-[540px] max-h-[85vh] rounded-t-2xl'
      }`}
    >
      {/* Header Bar */}
      <div className="flex h-11 items-center justify-between rounded-t-2xl bg-slate-900 px-4 text-white">
        <span className="text-xs font-semibold truncate">
          {subject.trim() ? subject : 'New Message'}
        </span>
        <div className="flex items-center gap-1.5 text-slate-300">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:text-white rounded"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          {!isMinimized && (
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:text-white rounded"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleDiscard}
            className="p-1 hover:text-white rounded"
            title="Close and Clear"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          {/* To Field */}
          <div className="flex items-center border-b border-slate-100 px-4 py-2 text-sm">
            <span className="w-12 text-slate-400 font-medium text-xs">To</span>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient email address"
              required
              className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
            />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="hover:text-blue-600 hover:underline"
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="hover:text-blue-600 hover:underline"
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {/* Cc Field */}
          {showCc && (
            <div className="flex items-center border-b border-slate-100 px-4 py-2 text-sm">
              <span className="w-12 text-slate-400 font-medium text-xs">Cc</span>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Cc recipients (comma separated)"
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
              />
            </div>
          )}

          {/* Bcc Field */}
          {showBcc && (
            <div className="flex items-center border-b border-slate-100 px-4 py-2 text-sm">
              <span className="w-12 text-slate-400 font-medium text-xs">Bcc</span>
              <input
                type="text"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="Bcc recipients (comma separated)"
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
              />
            </div>
          )}

          {/* Subject Field */}
          <div className="border-b border-slate-100 px-4 py-2.5">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full bg-transparent outline-none text-slate-900 font-medium text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Attachment list if added */}
          {attachment && (
            <div className="mx-4 mt-2 flex items-center justify-between rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span className="truncate font-medium">{attachment.name}</span>
                <span className="text-slate-400">({(attachment.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Email Body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Compose your email here..."
            className="flex-1 resize-none p-4 text-sm text-slate-800 outline-none leading-relaxed placeholder:text-slate-400"
          />

          {/* Bottom Action Toolbar (Gmail Style) */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={sending || !to.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {sending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Send
              </button>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleDraftSave}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition"
                title="Save as Draft"
              >
                Save Draft
              </button>
            </div>

            <button
              type="button"
              onClick={handleDiscard}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-red-600 transition"
              title="Discard draft"
            >
              <Trash2 className="h-4 w-4" />
            </button>
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

  const [activeChannel, setActiveChannel] = useState('messenger');
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
  const fileInput = useRef(null);
  const messagesEnd = useRef(null);

  // Email specific states
  const [emailFolder, setEmailFolder] = useState('inbox'); // 'inbox' | 'sent' | 'draft'
  const [showFullThreadInSent, setShowFullThreadInSent] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ connected: true, email: 'messiorasolutions@gmail.com' });
  const [emailSyncing, setEmailSyncing] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitial, setComposeInitial] = useState({ to: '', subject: '', body: '', conversationId: null });
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

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
      setSelected((current) => list.find((item) => item.conversation_id === current?.conversation_id) || list[0] || null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [activeChannel]);

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
  const inboxConversations = useMemo(() => {
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

  const displayedConversations = useMemo(() => {
    if (activeChannel !== 'email') return scopedConversations;
    if (emailFolder === 'sent') return sentConversations;
    if (emailFolder === 'inbox') return inboxConversations;
    return scopedConversations;
  }, [activeChannel, emailFolder, scopedConversations, sentConversations, inboxConversations]);

  const counts = useMemo(() => ({
    current: activeChannel === 'email'
      ? (emailFolder === 'sent' ? sentConversations.length : inboxConversations.length)
      : scopedConversations.length,
    inbox: inboxConversations.length,
    sent: sentConversations.length,
    draft: draftsList.length,
  }), [activeChannel, emailFolder, scopedConversations.length, inboxConversations.length, sentConversations.length, draftsList.length]);

  const handleSelectEmailFolder = (folder) => {
    setEmailFolder(folder);
    setShowFullThreadInSent(false);
    if (folder === 'inbox') {
      if (!inboxConversations.some((c) => c.conversation_id === selected?.conversation_id)) {
        setSelected(inboxConversations[0] || null);
      }
    } else if (folder === 'sent') {
      if (!sentConversations.some((c) => c.conversation_id === selected?.conversation_id)) {
        setSelected(sentConversations[0] || null);
      }
    }
  };

  // Send message via Chat Bubble bar (WhatsApp / Messenger / Quick Email)
  const send = async (event) => {
    event.preventDefault();
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
      await conversationService.sendMessage(selected.conversation_id, {
        content: draft.trim(),
        media_url: mediaUrl,
        media_source: 'system_storage',
        message_type: messageType,
      });
      setDraft('');
      setAttachment(null);
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Conversations</h1>
            
            {isWhatsAppConnected && waPhoneNumber && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Linked: +{waPhoneNumber}
              </span>
            )}
            {isEmail && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                Gmail: {emailStatus.email || 'messiorasolutions@gmail.com'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Manage incoming {config.label} conversations from one workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isWhatsAppConnected && (
            <button
              type="button"
              onClick={handleDisconnectWhatsApp}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
              title="Unlink Phone"
            >
              Unlink Device
            </button>
          )}
          {isEmail && (
            <>
              <button
                type="button"
                onClick={handleOpenComposeNew}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition"
                title="Compose New Email"
              >
                <Plus className="h-3.5 w-3.5" />
                Compose Email
              </button>
              <button
                type="button"
                onClick={handleSyncEmails}
                disabled={emailSyncing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition disabled:opacity-50"
                title="Sync New Emails"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${emailSyncing ? 'animate-spin' : ''}`} />
                {emailSyncing ? 'Checking...' : 'Sync Emails'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => loadConversations(activeChannel)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition shadow-2xs ${
                isActive
                  ? item.activeClass
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {renderChannelIcon(id)}
              <span>{item.label}</span>
              {isActive && (
                <span className="text-xs opacity-75 font-medium">({counts.current})</span>
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

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}><X className="h-4 w-4" /></button>
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
        <main className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[330px_minmax(0,1fr)]">
          {/* Left Sidebar */}
          <aside className="flex flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
            {/* Search Input Bar */}
            <div className="border-b border-slate-100 p-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-slate-50/50">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${config.label} messages`}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Email Filter Buttons: Inbox, Sent, Draft */}
              {isEmail && (
                <div className="mt-2.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSelectEmailFolder('inbox')}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                      emailFolder === 'inbox'
                        ? 'bg-violet-100 text-violet-800 border border-violet-200 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Inbox className="h-3.5 w-3.5" />
                    Inbox
                    <span className="rounded-full bg-violet-200 px-1.5 py-0.2 text-[10px] font-bold text-violet-800">
                      {inboxConversations.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEmailFolder('sent')}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                      emailFolder === 'sent'
                        ? 'bg-violet-100 text-violet-800 border border-violet-200 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Sent
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                      {sentConversations.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEmailFolder('draft')}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                      emailFolder === 'draft'
                        ? 'bg-violet-100 text-violet-800 border border-violet-200 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Draft
                    {draftsList.length > 0 && (
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700">
                        {draftsList.length}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Conversation List / Drafts List */}
            <div className="flex-1 overflow-y-auto max-h-[34rem]">
              {loading ? (
                <div className="flex justify-center p-8">
                  <LoaderCircle className={`h-5 w-5 animate-spin ${
                    isWhatsApp ? 'text-emerald-600' : isEmail ? 'text-violet-600' : 'text-blue-600'
                  }`} />
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
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New Draft
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {draftsList.map((d, index) => (
                      <div
                        key={index}
                        className="group flex items-start justify-between p-3.5 hover:bg-violet-50/50 transition cursor-pointer"
                        onClick={() => handleOpenDraft(d, index)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800">
                            {d.to || '(No Recipient)'}
                          </p>
                          <p className="truncate text-xs font-semibold text-violet-700">
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
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded"
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

          {/* Right Pane: Conversation Details / Actual Gmail Dashboard */}
          <section className="flex min-h-[34rem] min-w-0 flex-1 flex-col overflow-hidden bg-white">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                {isEmail ? (
                  <Mail className="mb-3 h-12 w-12 text-slate-200" />
                ) : (
                  <MessageCircle className="mb-3 h-12 w-12 text-slate-200" />
                )}
                <p className="font-semibold text-slate-700">Select a conversation</p>
                <p className="mt-1 text-sm text-slate-500">
                  Incoming {config.label} messages will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Header: Displays Thread Subject for Email (Gmail style) or Contact Name for WhatsApp/Messenger */}
                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isWhatsApp ? 'bg-emerald-100 text-emerald-700' : isEmail ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isEmail ? <Mail className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate font-bold text-slate-900 text-base">
                            {isEmail ? (threadSubject || clientDisplayName) : clientDisplayName}
                          </h2>
                          {isEmail && (
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              emailFolder === 'sent'
                                ? 'bg-violet-100 text-violet-700 border border-violet-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              {emailFolder === 'sent' ? 'Sent' : 'Inbox'}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500">
                          {isWhatsApp
                            ? `WhatsApp · +${selected.channel_client_id}`
                            : isEmail
                            ? `Email · ${selected.channel_client_id}`
                            : 'Facebook Messenger'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selected?.has_opportunity || selected?.opportunity ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Already Added to Opportunity
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsOpportunityModalOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition"
                          title="Add Opportunity from this contact"
                        >
                          <Target className="h-3.5 w-3.5" />
                          Add Opportunity
                        </button>
                      )}

                      {isEmail && (
                        <button
                          type="button"
                          onClick={() => handleReply({ to: selected.channel_client_id, subject: threadSubject })}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition"
                          title="Open Email Composer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Compose / Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Body Area: Authentic Gmail Dashboard for Email; Chat Bubbles for WhatsApp/Messenger */}
                <div className="flex-1 min-w-0 space-y-4 overflow-y-auto overflow-x-hidden bg-slate-50/50 p-4">
                  {messagesLoading ? (
                    <div className="flex justify-center p-8">
                      <LoaderCircle className={`h-5 w-5 animate-spin ${
                        isWhatsApp ? 'text-emerald-600' : isEmail ? 'text-violet-600' : 'text-blue-600'
                      }`} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400">
                      <Mail className="mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-xs">No messages in this thread yet.</p>
                    </div>
                  ) : isEmail ? (
                    /* Actual Gmail Right Dashboard Layout */
                    <div className="space-y-4 min-w-0 max-w-full">
                      {/* Sent Folder toggle banner if full thread has client messages too */}
                      {emailFolder === 'sent' && messages.some((m) => m.sender_type === 'client') && (
                        <div className="flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50/70 px-4 py-2 text-xs text-violet-800">
                          <span>
                            {showFullThreadInSent
                              ? `Viewing full thread (${messages.length} total messages)`
                              : `Showing sent emails only (${messages.filter((m) => m.sender_type === 'staff').length})`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowFullThreadInSent((prev) => !prev)}
                            className="font-semibold underline hover:text-violet-900 transition"
                          >
                            {showFullThreadInSent ? 'Show sent only' : 'View full thread with replies'}
                          </button>
                        </div>
                      )}

                      {(emailFolder === 'sent' && !showFullThreadInSent
                        ? messages.filter((m) => m.sender_type === 'staff')
                        : messages
                      ).map((message) => {
                        const isStaff = message.sender_type === 'staff';
                        const parsed = parseEmailContent(message.content);
                        const senderName = isStaff ? 'Edugate Global CRM' : (selected.clients?.name || selected.channel_client_id);
                        const senderEmail = isStaff ? emailStatus.email : selected.channel_client_id;

                        return (
                          <div
                            key={message.message_id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 min-w-0 max-w-full overflow-hidden"
                          >
                            {/* Email Sender Row */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                                  isStaff ? 'bg-violet-600 text-white' : 'bg-blue-600 text-white'
                                }`}>
                                  {senderName[0]?.toUpperCase() || 'E'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="text-sm font-bold text-slate-900 truncate">{senderName}</span>
                                    <span className="text-xs text-slate-500 truncate">&lt;{senderEmail}&gt;</span>
                                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                      isStaff ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {isStaff ? 'Sent' : 'Received'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <span>to {isStaff ? selected.channel_client_id : 'me'}</span>
                                    <ChevronDown className="h-3 w-3" />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                                <time>{formatEmailDate(message.created_at)}</time>
                                <button type="button" className="p-1 hover:text-amber-500 rounded" title="Star">
                                  <Star className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReply({ to: senderEmail, subject: parsed.subject || threadSubject })}
                                  className="p-1 hover:text-slate-800 rounded"
                                  title="Reply"
                                >
                                  <Reply className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Email Message Content: Fixed size and wrapped so big content does not stretch screen */}
                            <div className="mt-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap break-words [word-break:break-word] overflow-x-auto max-h-[500px] overflow-y-auto">
                              {parsed.body || '(No text content)'}
                            </div>

                            {/* Downloadable Attachment Preview */}
                            {message.media_url && (
                              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 max-w-md">
                                <div className="flex items-center gap-3 truncate">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
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
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 transition"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Bottom Quick Reply & Forward Buttons (Gmail Style) */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleReply({ to: selected.channel_client_id, subject: threadSubject })}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                        >
                          <Reply className="h-4 w-4" />
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForward({ subject: threadSubject, content: messages[messages.length - 1]?.content })}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                        >
                          <Forward className="h-4 w-4" />
                          Forward
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* WhatsApp & Messenger Bubble Chat View */
                    messages.map((message) => {
                      const isStaff = message.sender_type === 'staff';
                      const content = message.content || '';

                      return (
                        <div key={message.message_id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                            isStaff
                              ? isWhatsApp
                                ? 'rounded-br-sm bg-emerald-600 text-white'
                                : 'rounded-br-sm bg-blue-600 text-white'
                              : 'rounded-bl-sm bg-white text-slate-800 border border-slate-100'
                          }`}>
                            {content && (
                              <p className="whitespace-pre-wrap leading-relaxed text-xs">
                                {content}
                              </p>
                            )}

                            {message.media_url && (
                              <div className={`mt-3 flex items-center justify-between gap-3 rounded-xl p-2.5 ${
                                isStaff ? 'bg-white/10 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'
                              }`}>
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className={`h-4 w-4 shrink-0 ${isStaff ? 'text-white' : 'text-emerald-600'}`} />
                                  <span className="truncate text-xs font-medium">Attachment</span>
                                </div>
                                <a
                                  href={message.media_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-xs transition ${
                                    isStaff
                                      ? 'bg-white text-emerald-700 hover:bg-slate-100'
                                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  }`}
                                >
                                  <Download className="h-3 w-3" />
                                  Download
                                </a>
                              </div>
                            )}

                            <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                              isStaff
                                ? isWhatsApp ? 'text-emerald-100' : 'text-blue-100'
                                : 'text-slate-400'
                            }`}>
                              {new Date(message.created_at).toLocaleString()}
                              {isStaff && <CheckCheck className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEnd} />
                </div>

                {/* Bottom Quick Reply Bar (WhatsApp & Messenger only - Email replies via Compose/Reply modal) */}
                {!isEmail && (
                  <form onSubmit={send} className="border-t border-slate-100 p-3 bg-white">
                    {attachment && (
                      <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <span className="truncate">{attachment.name}</span>
                        <button type="button" onClick={() => setAttachment(null)}><X className="h-4 w-4" /></button>
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                        hidden
                        onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
                        title="Attach media"
                      >
                        <ImagePlus className="h-5 w-5" />
                      </button>
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows="1"
                        placeholder={`Write a ${config.label} reply...`}
                        className={`max-h-28 min-h-[42px] flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ${
                          isWhatsApp
                            ? 'focus:border-emerald-500'
                            : 'focus:border-blue-500'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={sending || (!draft.trim() && !attachment)}
                        className={`rounded-xl p-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50 transition ${
                          isWhatsApp
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        title="Send"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
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
