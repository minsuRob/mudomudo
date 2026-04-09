import { HStack, Image, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  background,
  font,
  foregroundStyle,
  multilineTextAlignment,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment, type WidgetFamily } from 'expo-widgets';

/** Mirrors `RecentList` in groceries `widgets.swift` / `widget_recent_lists` JSON. */
export type RecentListItem = {
  listId: string;
  name: string;
  emoji: string;
};

/**
 * Props mirror groceries widget UserDefaults keys:
 * - `widget_total_lists` → totalLists
 * - `widget_recent_lists` → recentLists
 */
export type MudomudoWidgetProps = {
  totalLists?: string;
  recentLists?: RecentListItem[] | null;
};

const basketGradient = foregroundStyle({
  type: 'linearGradient',
  colors: ['#FFEB3B', '#FF9800'],
  startPoint: { x: 0.5, y: 0 },
  endPoint: { x: 0.5, y: 1 },
});

function emptyStateMessage(family: WidgetFamily): string {
  if (family === 'systemSmall') return 'No lists yet!';
  if (family === 'systemMedium') return "You don't have any lists yet!";
  return "You don't have any lists yet.\nCreate one to get started!";
}

function listsToShow(family: WidgetFamily, lists: RecentListItem[]): RecentListItem[] {
  if (family === 'systemSmall' || family === 'systemMedium') {
    return lists.slice(0, 3);
  }
  return lists;
}

/**
 * Layout aligned with groceries-shopping-list-app `targets/widget/widgets.swift`
 * (commit 7fe7816525e06bba1fb9afdc7faa01017262b9ec).
 * iOS 17+ root `background()` maps to `containerBackground` — see Expo widgets docs.
 */
const MudomudoWidget = (props: MudomudoWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const isDark = environment.colorScheme === 'dark';
  const family = environment.widgetFamily;
  const bgColor = isDark ? '#2C2C2E' : '#E5E5EA';

  const totalLists = props.totalLists;
  const rawLists = props.recentLists;
  const hasDecodedLists = rawLists != null;
  const displayLists = hasDecodedLists && rawLists ? listsToShow(family, rawLists) : [];

  return (
    <ZStack alignment="topLeading" modifiers={[background(bgColor), padding({ all: 12 })]}>
      <HStack alignment="top">
        <VStack alignment="leading" spacing={6}>
          <HStack spacing={8} alignment="center">
            <Image systemName="basket" size={17} modifiers={[basketGradient]} />
            <Text
              modifiers={[
                font({ size: 17, weight: 'semibold' }),
                foregroundStyle({ type: 'hierarchical', style: 'primary' }),
              ]}>
              Shopping
            </Text>
          </HStack>

          {totalLists != null && totalLists !== '' ? (
            <Text
              modifiers={[
                font({ size: 15, weight: 'regular' }),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ]}>
              {totalLists} lists
            </Text>
          ) : null}

          {hasDecodedLists ? (
            <VStack alignment="leading" spacing={4}>
              {displayLists.map((list) => (
                <HStack key={list.listId} spacing={6} alignment="center">
                  <Text
                    modifiers={[
                      font({ size: 14 }),
                      foregroundStyle({ type: 'hierarchical', style: 'primary' }),
                    ]}>
                    {list.emoji}
                  </Text>
                  <Text
                    modifiers={[
                      font({ size: 14 }),
                      foregroundStyle({ type: 'hierarchical', style: 'primary' }),
                    ]}>
                    {list.name}
                  </Text>
                </HStack>
              ))}
            </VStack>
          ) : (
            <VStack alignment="center" spacing={0}>
              <Text modifiers={[font({ size: 34 })]}>📝</Text>
              <Text
                modifiers={[
                  font({ size: 15, weight: 'regular' }),
                  multilineTextAlignment('center'),
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                  padding({ horizontal: 8 }),
                ]}>
                {emptyStateMessage(family)}
              </Text>
            </VStack>
          )}
        </VStack>
      </HStack>

      {family !== 'systemSmall' ? (
        <VStack alignment="trailing">
          <Spacer />
          <HStack>
            <Spacer />
            <Text
              modifiers={[
                font({ size: 10, weight: 'semibold' }),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                padding({ trailing: 4 }),
              ]}>
              Powered by Expo
            </Text>
          </HStack>
        </VStack>
      ) : null}
    </ZStack>
  );
};

const Widget = createWidget('MudomudoWidget', MudomudoWidget);
export default Widget;
