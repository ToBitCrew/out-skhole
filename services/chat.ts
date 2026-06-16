import type { ChatRoom, ChatMessagesResponse } from "@/types/api";
import api from "./api";

export async function getChatRooms() {
  const { data } = await api.get<{
    success: true;
    data: { items: ChatRoom[] };
  }>("/chats");
  return data.data.items;
}

export async function createChatRoom(partnerUid: number) {
  const { data } = await api.post<{
    success: true;
    data: { chat_room_id: number };
  }>("/chats", { partner_uid: partnerUid });
  return data.data;
}

export async function leaveChatRoom(roomId: number) {
  await api.delete(`/chats/${roomId}`);
}

export async function getMessages(
  roomId: number,
  params?: { before?: number; limit?: number }
) {
  const { data } = await api.get<{
    success: true;
    data: ChatMessagesResponse;
  }>(`/chats/${roomId}/messages`, { params });
  return data.data;
}

export async function sendMessage(
  roomId: number,
  body: { content: string; msg_type?: number }
) {
  const { data } = await api.post<{
    success: true;
    data: { chat_block_id: number; sent_dt: string };
  }>(`/chats/${roomId}/messages`, body);
  return data.data;
}

export async function markMessagesRead(roomId: number) {
  await api.patch(`/chats/${roomId}/messages/read`);
}

export async function deleteMessage(roomId: number, messageId: number) {
  await api.delete(`/chats/${roomId}/messages/${messageId}`);
}
