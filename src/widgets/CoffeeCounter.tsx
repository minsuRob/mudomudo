import { Button, Text, VStack } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type CoffeeCounterProps = {
  count: number;
};

/**
 * Blog sample: https://expo.dev/blog/home-screen-widgets-and-live-activities-in-expo
 * iOS 17+ requires root `background()` for `containerBackground` mapping.
 */
const CoffeeCounter = (props: CoffeeCounterProps, environment: WidgetEnvironment) => {
  'widget';
  const isDark = environment.colorScheme === 'dark';
  const bgColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const accent = '#FFFFFF';

  return (
    <VStack spacing={8} modifiers={[background(bgColor), padding({ all: 12 })]}>
      <Text modifiers={[font({ size: 48 })]}>☕</Text>
      <Text modifiers={[font({ size: 32, weight: 'bold' })]}>{props.count}</Text>
      <Button
        modifiers={[foregroundStyle(accent)]}
        label="+"
        target="increment"
        onPress={() => ({ count: props.count + 1 })}
      />
    </VStack>
  );
};

export default createWidget('CoffeeCounter', CoffeeCounter);
