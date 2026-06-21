import Notification from '../models/Notification.js';
import { emitEvent } from '../config/socket.js';

export async function createNotification({ userId, type, title, message, metadata = {} }) {
  const notification = await Notification.create({ userId, type, title, message, metadata });
  emitEvent('notification', notification);
  return notification;
}

export async function notifyAll({ type, title, message, metadata = {} }) {
  const notification = await createNotification({ userId: null, type, title, message, metadata });
  emitEvent('notification', notification);
  return notification;
}
