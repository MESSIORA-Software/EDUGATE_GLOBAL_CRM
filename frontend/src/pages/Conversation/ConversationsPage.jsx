import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCheck, ImagePlus, LoaderCircle, MessageCircle, RefreshCw, Search, Send,
  UserRound, X,
} from 'lucide-react';
import conversationService from '../../services/Conversation/conversationService';

const channelConfig = {
  messenger: { label: 'Messenger', color: 'bg-[#1877F2]' },
  whatsapp: { label: 'WhatsApp', color: 'bg-[#25D366]' },
  email: { label: 'Email', color: 'bg-violet-600' },
  sms: { label: 'Messages & calls', color: 'bg-red-500' },
};

const getErrorMessage = (error) => error?.response?.data?.message || 'Unable to load conversations.';

function ConversationList({ conversations, selectedId, onSelect, search }) {
  const filtered = conversations.filter((item) => {
    const name = item.clients?.name || 'Facebook user';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="divide-y divide-slate-100">
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">No Messenger conversations found.</div>
      ) : filtered.map((item) => {
        const name = item.clients?.name || 'Facebook user';
        return (
          <button
            key={item.conversation_id}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full p-4 text-left transition hover:bg-blue-50/60 ${selectedId === item.conversation_id ? 'bg-blue-50 border-r-2 border-blue-600' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <UserRound className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                  <time className="shrink-0 text-[10px] text-slate-400">
                    {item.last_message_at ? new Date(item.last_message_at).toLocaleDateString() : ''}
                  </time>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {item.status === 'open' ? 'Open conversation' : item.status}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function ConversationsPage() {
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

  useEffect(() => { loadConversations(); }, [loadConversations]);
  useEffect(() => { loadMessages(selected); }, [loadMessages, selected]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const counts = useMemo(() => ({ messenger: conversations.length }), [conversations]);

  const send = async (event) => {
    event.preventDefault();
    if (!selected || (!draft.trim() && !attachment) || sending) return;
    setSending(true);
    setError('');
    try {
      let mediaUrl;
      let messageType = 'image';
      if (attachment) {
        const uploadResponse = await conversationService.uploadMedia(attachment);
        mediaUrl = uploadResponse?.data?.data?.media_url;
        messageType = attachment.type.startsWith('video/') ? 'video' : attachment.type.startsWith('audio/') ? 'audio' : 'image';
      }
      await conversationService.sendMessage(selected.conversation_id, {
        content: draft.trim(),
        media_url: mediaUrl,
        media_source: 'supabase',
        message_type: messageType,
      });
      setDraft('');
      setAttachment(null);
      await loadMessages(selected);
      await loadConversations();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  };

  const config = channelConfig[activeChannel];
  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Conversations</h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{counts.messenger} Messenger</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Manage incoming Facebook Messenger conversations from one workspace.</p>
        </div>
        <button type="button" onClick={() => loadConversations()} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" title="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto">
        {Object.entries(channelConfig).map(([id, item]) => (
          <button
            key={id}
            type="button"
            onClick={() => { setActiveChannel(id); setSelected(null); }}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${activeChannel === id ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />{item.label}
            {id === 'messenger' && <span className="text-xs text-slate-400">({counts.messenger})</span>}
          </button>
        ))}
      </div>

      {error && <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => setError('')}><X className="h-4 w-4" /></button></div>}

      {activeChannel !== 'messenger' ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <MessageCircle className="mb-3 h-10 w-10 text-slate-300" />
          <h2 className="font-semibold text-slate-800">{config.label} is ready for integration</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">Messenger is connected to this workspace. The other channel cards remain available for their respective integrations.</p>
        </div>
      ) : (
        <main className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-100 p-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </div>
            </div>
            <div className="max-h-[32rem] overflow-y-auto">
              {loading ? <div className="flex justify-center p-8"><LoaderCircle className="h-5 w-5 animate-spin text-blue-600" /></div> : <ConversationList conversations={conversations} selectedId={selected?.conversation_id} onSelect={setSelected} search={search} />}
            </div>
          </aside>

          <section className="flex min-h-[32rem] flex-col">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageCircle className="mb-3 h-12 w-12 text-slate-200" /><p className="font-semibold text-slate-700">Select a conversation</p><p className="mt-1 text-sm text-slate-500">Incoming Messenger messages will appear here.</p></div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700"><UserRound className="h-5 w-5" /></div>
                  <div><h2 className="font-semibold text-slate-900">{selected.clients?.name || 'Facebook user'}</h2><p className="text-xs text-slate-500">Facebook Messenger</p></div>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
                  {messagesLoading ? <div className="flex justify-center p-8"><LoaderCircle className="h-5 w-5 animate-spin text-blue-600" /></div> : messages.map((message) => (
                    <div key={message.message_id} className={`flex ${message.sender_type === 'staff' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${message.sender_type === 'staff' ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm bg-white text-slate-800 shadow-sm'}`}>
                        {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                        {message.media_url && <a href={message.media_url} target="_blank" rel="noreferrer" className="mt-1 block underline">View attachment</a>}
                        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${message.sender_type === 'staff' ? 'text-blue-100' : 'text-slate-400'}`}>{new Date(message.created_at).toLocaleString()} {message.sender_type === 'staff' && <CheckCheck className="h-3 w-3" />}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEnd} />
                </div>
                <form onSubmit={send} className="border-t border-slate-100 p-3">
                  {attachment && <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"><span className="truncate">{attachment.name}</span><button type="button" onClick={() => setAttachment(null)}><X className="h-4 w-4" /></button></div>}
                  <div className="flex items-end gap-2">
                    <input ref={fileInput} type="file" accept="image/*,video/*,audio/*" hidden onChange={(event) => setAttachment(event.target.files?.[0] || null)} />
                    <button type="button" onClick={() => fileInput.current?.click()} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" title="Attach media"><ImagePlus className="h-5 w-5" /></button>
                    <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows="1" placeholder="Write a reply..." className="max-h-28 min-h-[42px] flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                    <button type="submit" disabled={sending || (!draft.trim() && !attachment)} className="rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" title="Send"><Send className="h-5 w-5" /></button>
                  </div>
                </form>
              </>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
