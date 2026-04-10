import { ExtensionStorage } from '@bacons/apple-targets';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
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

const storage = new ExtensionStorage(APP_GROUP);

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

function parseTodos(raw: string | null): Todo[] {
  if (raw == null || raw === '') return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => ({
        id: String(item.id ?? ''),
        title: String(item.title ?? ''),
        completed: Boolean(item.completed),
      }))
      .filter((t) => t.id !== '');
  } catch {
    return [];
  }
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
    const payload = next.map(({ id, title, completed }) => ({ id, title, completed }));
    setTodos(next);
    storage.set(
      STORAGE_KEY,
      payload as unknown as NonNullable<Parameters<ExtensionStorage['set']>[1]>,
    );
  };

  const handleAddTodo = (title: string) => {
    persist([
      ...todos,
      {
        id: Math.random().toString(36).substring(2, 15),
        title,
        completed: false,
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
          <TodoItem item={item} onDelete={handleDeleteTodo} onToggle={handleToggleTodo} />
        )}
        ListHeaderComponent={<TodoInput onAddTodo={handleAddTodo} />}
        ListFooterComponent={<TodoFooter todos={todos} />}
      />
      <Button title="Clean widget data" onPress={cleanWidgetData} />
    </>
  );
}

function TodoInput({ onAddTodo }: { onAddTodo: (title: string) => void }) {
  const [text, setText] = useState('');
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
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
        onSubmitEditing={() => {
          if (text.trim() === '') return;
          onAddTodo(text);
          setText('');
        }}
        value={text}
        onChangeText={setText}
      />
      <Pressable
        style={{ backgroundColor: 'black', padding: 10, borderRadius: 10 }}
        onPress={() => {
          if (text.trim() === '') return;
          onAddTodo(text);
          setText('');
        }}>
        <Ionicons name="add" size={20} color="white" />
      </Pressable>
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
        Add todos here and pin the home screen widget (iOS) to see them on the Home Screen.
      </Text>
    </View>
  );
}

function TodoItem({
  item,
  onDelete,
  onToggle,
}: {
  item: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <Pressable
      onPress={() => {
        onToggle(item.id);
      }}
      style={{
        padding: 10,
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          textDecorationLine: item.completed ? 'line-through' : 'none',
          opacity: item.completed ? 0.5 : 1,
        }}>
        {item.title}
      </Text>

      <Pressable
        onPress={() => {
          onDelete(item.id);
        }}
        style={{ marginLeft: 'auto' }}>
        <Ionicons name="trash" size={20} color="gray" />
      </Pressable>
    </Pressable>
  );
}
