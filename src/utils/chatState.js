export const mergeMessages = (history, liveMessages) => {
  const messagesById = new Map(history.map((message) => [message._id, message]));
  for (const message of liveMessages) messagesById.set(message._id, message);

  return [...messagesById.values()].sort(
    (first, second) => new Date(first.createdAt) - new Date(second.createdAt)
  );
};