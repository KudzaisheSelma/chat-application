import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

export default function ChatScreen({ roomId = 'general', userId = 'user1', username = 'User' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);
    socketRef.current.emit('room:join', roomId);
    socketRef.current.emit('user:join', { userId, username });

    socketRef.current.on('message:received', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socketRef.current?.disconnect();
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socketRef.current?.emit('message:send', { roomId, message: input, senderId: userId, senderName: username });
    setInput('');
  };

  return (
    <View style={styles.container}>
      <FlatList data={messages} keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.senderId === userId && styles.myBubble]}>
            <Text style={styles.sender}>{item.senderName}</Text>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type a message..." />
        <TouchableOpacity style={styles.send} onPress={sendMessage}><Text style={styles.sendText}>Send</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  bubble: { margin: 8, padding: 12, backgroundColor: '#fff', borderRadius: 12, maxWidth: '75%', alignSelf: 'flex-start' },
  myBubble: { backgroundColor: '#3b82f6', alignSelf: 'flex-end' },
  sender: { fontSize: 11, color: '#888', marginBottom: 2 },
  message: { fontSize: 16 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
  send: { backgroundColor: '#3b82f6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: 'bold' },
});
