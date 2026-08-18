import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MessageCircle, Send, Wifi, WifiOff, Bell, BellOff } from "lucide-react";
import { getEventMessages } from "../api/chat.api";
import { createChatSocket } from "../socket";
import { useToast } from "../context/useToast";

const NOTIFICATIONS_SUPPORTED =
  typeof window !== "undefined" && "Notification" in window;

// Push-style desktop notifications for this event's chat, via the
// browser Notification API - no separate push service needed since we
// already hold a live socket connection while this page is open. Fires
// only for messages from someone else, and only while the tab is in the
// background/hidden, so it doesn't double up with the on-screen bubble.
function notifyNewMessage(eventTitle, message) {
  if (!NOTIFICATIONS_SUPPORTED || Notification.permission !== "granted") return;
  if (!document.hidden) return;

  const notification = new Notification(
    `${message.userId?.name || "Someone"} in ${eventTitle}`,
    {
      body: message.text,
      icon: "/logo.png",
      tag: `event-chat-${message.eventId}`,
    },
  );
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

// Open discussion thread for an event - anyone signed in can read and
// post here, whether or not they actually booked a ticket, so people who
// couldn't make it can still share opinions / ask questions. Real-time
// via Socket.io: history loads once over REST, then new messages arrive
// live over the "event:<id>" room (see backend/src/socket/index.js).
function EventChat({ eventId, eventTitle = "this event" }) {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const toast = useToast();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(Boolean(authStatus));
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    NOTIFICATIONS_SUPPORTED ? Notification.permission : "unsupported",
  );
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const notificationsOn = notifPermission === "granted";

  const handleToggleNotifications = async () => {
    if (!NOTIFICATIONS_SUPPORTED) {
      toast.info("Your browser doesn't support notifications.");
      return;
    }
    if (notificationsOn) {
      // The Notification API has no "revoke" call from JS - the closest
      // we can do is tell the user it lives in browser settings, and stop
      // firing on our end isn't possible without a permission change, so
      // just explain instead of pretending to turn it off.
      toast.info("To stop notifications, disable them for this site in your browser settings.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === "granted") {
      toast.success("You'll get a notification when someone replies here.", {
        title: "Notifications on",
      });
    } else if (permission === "denied") {
      toast.error("Notifications are blocked for this site.");
    }
  };

  useEffect(() => {
    if (!authStatus) return;

    getEventMessages(eventId)
      .then((res) => setMessages(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    const socket = createChatSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-event", eventId);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", () => {
      setConnected(false);
    });

    socket.on("new-message", (message) => {
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));

      if (message.userId?._id !== userData?._id) {
        notifyNewMessage(eventTitle, message);
      }
    });

    return () => {
      socket.emit("leave-event", eventId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, authStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    const socket = socketRef.current;
    if (!text.trim() || sending || !socket) return;

    setSending(true);
    const outgoing = text.trim();
    setText("");

    socket.emit("send-message", { eventId, text: outgoing }, (res) => {
      setSending(false);
      if (!res?.ok) {
        toast.error(res?.message || "Message couldn't be sent.");
        setText(outgoing);
      }
      // On success the message arrives back through the "new-message"
      // broadcast (which includes our own socket), so no local push here.
    });
  };

  return (
    <div className="mt-10 bg-slate-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
        <MessageCircle className="text-violet-400" size={20} />
        <h2 className="text-xl font-semibold">Event Discussion</h2>

        {authStatus && (
          <span
            className={`flex items-center gap-1 text-xs ml-2 ${
              connected ? "text-emerald-400" : "text-gray-500"
            }`}
            title={connected ? "Live" : "Connecting..."}
          >
            {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {connected ? "Live" : "Connecting..."}
          </span>
        )}

        <span className="text-gray-500 text-xs ml-auto">
          Open to everyone - even if you're not attending
        </span>

        {authStatus && NOTIFICATIONS_SUPPORTED && (
          <button
            type="button"
            onClick={handleToggleNotifications}
            title={
              notificationsOn
                ? "Notifications are on for this chat"
                : "Get notified about new messages"
            }
            className={`flex items-center gap-1 text-xs ml-3 cursor-pointer ${
              notificationsOn
                ? "text-violet-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {notificationsOn ? <Bell size={14} /> : <BellOff size={14} />}
          </button>
        )}
      </div>

      {!authStatus ? (
        <div className="px-6 py-8 text-center text-gray-400">
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
            Log in
          </Link>{" "}
          to join the discussion.
        </div>
      ) : (
        <>
          <div className="max-h-80 overflow-y-auto px-6 py-4 space-y-4">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading discussion...</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No messages yet - be the first to say something.
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.userId?._id === userData?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isMe
                          ? "bg-violet-600 text-white rounded-br-sm"
                          : "bg-slate-800 text-gray-100 rounded-bl-sm"
                      }`}
                    >
                      {!isMe && (
                        <p className="text-violet-400 text-xs font-semibold mb-0.5">
                          {msg.userId?.name || "Someone"}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.text}</p>
                      <p className="text-[10px] text-gray-300/60 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-3 px-6 py-4 border-t border-gray-800">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts or ask a question..."
              maxLength={500}
              className="flex-1 bg-slate-800 border border-gray-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl font-semibold cursor-pointer transition"
            >
              <Send size={16} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default EventChat;
