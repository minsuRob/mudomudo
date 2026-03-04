import { HStack, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetBase } from 'expo-widgets';

/**
 * Home / Explore 기준 위젯 props
 * - Home: Welcome to Expo, get started
 * - Explore: Explore 탭 요약
 */
export type MudomudoWidgetProps = {
  /** Home 화면 제목 */
  homeTitle?: string;
  /** Home 화면 부제 */
  homeSubtitle?: string;
  /** Explore 탭 라벨 */
  exploreLabel?: string;
  /** 마지막 업데이트 시각 표시용 */
  updatedAt?: string;
};

function MudomudoWidgetComponent(props: WidgetBase<MudomudoWidgetProps>) {
  'widget';

  const homeTitle = props.homeTitle ?? 'Welcome to Expo';
  const homeSubtitle = props.homeSubtitle ?? 'get started';
  const exploreLabel = props.exploreLabel ?? 'Explore';
  const updatedAt = props.updatedAt ?? '';

  const textModifiers = [
    font({ weight: 'bold', size: 14 }),
    foregroundStyle('#000000'),
  ];
  const secondaryModifiers = [
    font({ size: 12 }),
    foregroundStyle('#666666'),
  ];

  if (props.family === 'systemSmall') {
    return (
      <VStack modifiers={[padding({ all: 12 })]} spacing={4}>
        <Text modifiers={textModifiers}>{homeTitle}</Text>
        <Text modifiers={secondaryModifiers}>{homeSubtitle}</Text>
        {updatedAt ? (
          <Text modifiers={[font({ size: 10 }), foregroundStyle('#999999')]}>
            {updatedAt}
          </Text>
        ) : null}
      </VStack>
    );
  }

  if (props.family === 'systemMedium') {
    return (
      <HStack modifiers={[padding({ all: 12 })]} spacing={12}>
        <VStack spacing={4}>
          <Text modifiers={textModifiers}>{homeTitle}</Text>
          <Text modifiers={secondaryModifiers}>{homeSubtitle}</Text>
        </VStack>
        <VStack spacing={2} alignment="trailing">
          <Text modifiers={secondaryModifiers}>{exploreLabel}</Text>
          {updatedAt ? (
            <Text modifiers={[font({ size: 10 }), foregroundStyle('#999999')]}>
              {updatedAt}
            </Text>
          ) : null}
        </VStack>
      </HStack>
    );
  }

  // systemLarge
  return (
    <VStack modifiers={[padding({ all: 16 })]} spacing={12}>
      <VStack spacing={4}>
        <Text modifiers={[font({ weight: 'bold', size: 18 }), foregroundStyle('#000000')]}>
          {homeTitle}
        </Text>
        <Text modifiers={secondaryModifiers}>{homeSubtitle}</Text>
      </VStack>
      <VStack spacing={4}>
        <Text modifiers={[font({ weight: 'semibold', size: 14 }), foregroundStyle('#208AEF')]}>
          {exploreLabel}
        </Text>
        <Text modifiers={secondaryModifiers}>
          File-based routing · Android, iOS, web
        </Text>
      </VStack>
      {updatedAt ? (
        <Text modifiers={[font({ size: 10 }), foregroundStyle('#999999')]}>
          Updated {updatedAt}
        </Text>
      ) : null}
    </VStack>
  );
}

const MudomudoWidget = createWidget('MudomudoWidget', MudomudoWidgetComponent);
export default MudomudoWidget;
