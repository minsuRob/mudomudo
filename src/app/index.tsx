import { ExtensionStorage } from '@bacons/apple-targets';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Button,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

const APP_GROUP = 'group.com.mudomudo.app';
const STORAGE_KEY = 'widget_todos';

/** Max width for stored thumbnails (keeps UserDefaults + widget payloads small). */
const THUMB_WIDTH = 56;
const JPEG_QUALITY = 0.42;

const storage = new ExtensionStorage(APP_GROUP);

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  thumbBase64?: string;
};

function parseTodos(raw: string | null): Todo[] {
  if (raw == null || raw === '') return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => {
        const thumb = item.thumbBase64;
        return {
          id: String(item.id ?? ''),
          title: String(item.title ?? ''),
          completed: Boolean(item.completed),
          ...(typeof thumb === 'string' && thumb.length > 0 ? { thumbBase64: thumb } : {}),
        };
      })
      .filter((t) => t.id !== '');
  } catch {
    return [];
  }
}

async function pickAndShrinkToBase64(): Promise<string | null> {
  if (Platform.OS === 'web') {
    Alert.alert('알림', '이미지 첨부는 iOS·Android 앱에서만 지원됩니다.');
    return null;
  }
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('권한 필요', '사진 라이브러리 접근을 허용해 주세요.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  const uri = result.assets[0].uri;
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: THUMB_WIDTH } }],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );
  return manipulated.base64 ?? null;
}

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    setTodos(parseTodos(storage.get(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (status === 'background' && Platform.OS === 'ios') {
        ExtensionStorage.reloadWidget();
      }
    });
    return () => sub.remove();
  }, []);

  const persist = (next: Todo[]) => {
    const payload = next.map(({ id, title, completed, thumbBase64 }) => ({
      id,
      title,
      completed,
      ...(thumbBase64 ? { thumbBase64 } : {}),
    }));
    setTodos(next);
    storage.set(
      STORAGE_KEY,
      payload as unknown as NonNullable<Parameters<ExtensionStorage['set']>[1]>,
    );
  };

  const handleAddTodo = (title: string, thumbBase64?: string) => {
    persist([
      ...todos,
      {
        id: Math.random().toString(36).substring(2, 15),
        title,
        completed: false,
        ...(thumbBase64 ? { thumbBase64 } : {}),
      },
    ]);
  };

  const handleDeleteTodo = (id: string) => {
    persist(todos.filter((todo) => todo.id !== id));
  };

  const handleToggleTodo = (id: string) => {
    persist(
      todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );
  };

  const handleSetTodoThumb = (id: string, thumbBase64: string | undefined) => {
    persist(
      todos.map((todo) => {
        if (todo.id !== id) return todo;
        if (!thumbBase64) {
          const { thumbBase64: _removed, ...rest } = todo;
          return rest;
        }
        return { ...todo, thumbBase64 };
      }),
    );
  };

  const cleanWidgetData = () => {
    storage.set(STORAGE_KEY, []);
    setTodos([]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mudomudo',
          headerLargeTitle: true,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 10 }}
        contentInsetAdjustmentBehavior="automatic"
        renderItem={({ item }) => (
          <TodoItem
            item={item}
            onDelete={handleDeleteTodo}
            onToggle={handleToggleTodo}
            onSetThumb={handleSetTodoThumb}
          />
        )}
        ListHeaderComponent={<TodoInput onAddTodo={handleAddTodo} />}
        ListFooterComponent={<TodoFooter todos={todos} />}
      />
      <Button title="Clean widget data" onPress={cleanWidgetData} />
    </>
  );
}

function TodoInput({ onAddTodo }: { onAddTodo: (title: string, thumbBase64?: string) => void }) {
  const [text, setText] = useState('');
  const [thumb, setThumb] = useState<string | undefined>();
  const [picking, setPicking] = useState(false);

  const attach = async () => {
    setPicking(true);
    try {
      const b64 = await pickAndShrinkToBase64();
      if (b64) setThumb(b64);
    } finally {
      setPicking(false);
    }
  };

  const submit = () => {
    if (text.trim() === '') return;
    onAddTodo(text.trim(), thumb);
    setText('');
    setThumb(undefined);
  };

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
        <TextInput
          placeholder="Add a new todo"
          style={{
            flexGrow: 1,
            borderBottomWidth: 2,
            borderBottomColor: 'gray',
            padding: 10,
            fontSize: 16,
            fontWeight: '600',
          }}
          onSubmitEditing={submit}
          value={text}
          onChangeText={setText}
        />
        <Pressable
          accessibilityLabel="Attach small image"
          style={{
            backgroundColor: '#444',
            padding: 10,
            borderRadius: 10,
            opacity: picking ? 0.5 : 1,
          }}
          disabled={picking}
          onPress={attach}>
          {picking ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="image-outline" size={20} color="white" />
          )}
        </Pressable>
        <Pressable
          style={{ backgroundColor: 'black', padding: 10, borderRadius: 10 }}
          onPress={submit}>
          <Ionicons name="add" size={20} color="white" />
        </Pressable>
      </View>
      {thumb ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${thumb}` }}
            style={{ width: 40, height: 40, borderRadius: 6 }}
            contentFit="cover"
          />
          <Pressable onPress={() => setThumb(undefined)}>
            <Text style={{ color: '#888', fontSize: 13 }}>썸네일 제거</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function TodoFooter({ todos }: { todos: Todo[] }) {
  return (
    <View style={{ gap: 10, paddingTop: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>
        Your remaining todos: {todos.filter((todo) => !todo.completed).length}
      </Text>
      <Text style={{ fontStyle: 'italic', color: 'gray', fontSize: 16 }}>
        사진을 고르면 {THUMB_WIDTH}px 너비로 줄여 저장합니다. iOS 위젯에도 같은 썸네일이 보입니다.
      </Text>
    </View>
  );
}

function TodoItem({
  item,
  onDelete,
  onToggle,
  onSetThumb,
}: {
  item: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onSetThumb: (id: string, thumb: string | undefined) => void;
}) {
  const [picking, setPicking] = useState(false);

  const attach = async () => {
    setPicking(true);
    try {
      const b64 = await pickAndShrinkToBase64();
      if (b64) onSetThumb(item.id, b64);
    } finally {
      setPicking(false);
    }
  };

  return (
    <View
      style={{
        padding: 10,
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}>
      <Pressable
        onPress={() => onToggle(item.id)}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: 'lightgray',
            backgroundColor: item.completed ? 'gray' : undefined,
          }}>
          {item.completed && <Ionicons name="checkmark-sharp" size={20} color="white" />}
        </View>
        {item.thumbBase64 ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.thumbBase64}` }}
            style={{ width: 36, height: 36, borderRadius: 6 }}
            contentFit="cover"
          />
        ) : null}
        <Text
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            textDecorationLine: item.completed ? 'line-through' : 'none',
            opacity: item.completed ? 0.5 : 1,
          }}>
          {item.title}
        </Text>
      </Pressable>

      <Pressable
        accessibilityLabel="Attach image to this todo"
        hitSlop={8}
        disabled={picking}
        onPress={attach}
        style={{ padding: 4 }}>
        {picking ? (
          <ActivityIndicator size="small" />
        ) : (
          <Ionicons name="image-outline" size={20} color="#666" />
        )}
      </Pressable>

      <Pressable onPress={() => onDelete(item.id)} style={{ padding: 4 }}>
        <Ionicons name="trash" size={20} color="gray" />
      </Pressable>
    </View>
  );
}
