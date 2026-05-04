import './SocialTraining.css';

// 대화 말풍선 랜더링
// 백엔드에서 받은 messagge 기준으로 speaker가 character / user 인지...
function ConversationLog({ messages, compact = false }) {
  return (
    <div className={`social-conversation-log ${compact ? 'is-compact' : ''}`}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`social-chat-bubble social-message-bubble is-${message.speaker}`}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
}

export default ConversationLog;
