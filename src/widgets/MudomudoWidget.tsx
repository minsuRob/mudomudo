import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetBase } from 'expo-widgets';

type MudomudoWidgetProps = {
  message?: string;
};

const MudomudoWidget = (props: WidgetBase<MudomudoWidgetProps>) => {
  'widget';
  return (
    <VStack>
      <Text
        modifiers={[
          font({ weight: 'bold', size: 16 }),
          foregroundStyle('#000000'),
        ]}
      >
        {props.message ?? 'Mudomudo'}
      </Text>
    </VStack>
  );
};

const Widget = createWidget('MudomudoWidget', MudomudoWidget);
export default Widget;
