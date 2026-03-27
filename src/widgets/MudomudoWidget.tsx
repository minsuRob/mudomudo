import { Text, VStack } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type MudomudoWidgetProps = {
  message?: string;
};

/**
 * iOS 17+ requires WidgetKit to use `containerBackground`. Expo maps the root
 * `background()` modifier to that API — see https://docs.expo.dev/versions/latest/sdk/widgets/
 */
const MudomudoWidget = (props: MudomudoWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const isDark = environment.colorScheme === 'dark';
  const bgColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <VStack modifiers={[background(bgColor), padding({ all: 12 })]}>
      <Text modifiers={[font({ weight: 'bold', size: 16 }), foregroundStyle(textColor)]}>
        {props.message ?? 'Mudomudo'}
      </Text>
    </VStack>
  );
};

const Widget = createWidget('MudomudoWidget', MudomudoWidget);
export default Widget;
