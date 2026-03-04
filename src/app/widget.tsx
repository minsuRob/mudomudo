import { Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const isIOS = Platform.OS === 'ios';

export default function WidgetScreen() {
  const handleUpdateWidget = () => {
    if (!isIOS) return;
    const MudomudoWidget = require('@/widgets/MudomudoWidget').default;
    const now = new Date();
    const timeStr = now.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    MudomudoWidget.updateSnapshot({
      homeTitle: 'Welcome to Expo',
      homeSubtitle: 'get started',
      exploreLabel: 'Explore',
      updatedAt: timeStr,
    });
    MudomudoWidget.reload();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            Home Screen Widget
          </ThemedText>
          <ThemedText style={styles.description} themeColor="textSecondary">
            Home과 Explore 요약을 홈 화면 위젯으로 표시합니다. (iOS 전용)
          </ThemedText>

          {isIOS ? (
            <>
              <ThemedText type="small" style={styles.hint} themeColor="textSecondary">
                홈 화면에서 위젯을 추가한 뒤, 아래 버튼으로 내용을 갱신하세요.
              </ThemedText>
              <Pressable
                onPress={handleUpdateWidget}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                <ThemedView type="backgroundElement" style={styles.buttonInner}>
                  <ThemedText type="smallBold">위젯 지금 갱신</ThemedText>
                </ThemedView>
              </Pressable>
            </>
          ) : (
            <ThemedView type="backgroundElement" style={styles.webPlaceholder}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.webPlaceholderText}>
                위젯은 iOS에서만 사용할 수 있습니다.
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.webPlaceholderSub}>
                iOS 기기 또는 시뮬레이터에서 앱을 실행하면 위젯 갱신 버튼을 사용할 수 있습니다.
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  content: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.three,
  },
  title: {
    marginBottom: Spacing.one,
  },
  description: {
    marginBottom: Spacing.four,
  },
  hint: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  button: {
    alignSelf: 'flex-start',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonInner: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
  },
  webPlaceholder: {
    marginTop: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  webPlaceholderText: {
    fontWeight: '600',
  },
  webPlaceholderSub: {
    opacity: 0.9,
  },
});
