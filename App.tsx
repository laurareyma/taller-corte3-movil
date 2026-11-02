import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ArmoryGrid } from './src/components/ArmoryGrid';
import { HeroAvatarHUD } from './src/components/HeroAvatarHUD';
import { ReduxLiveInspector } from './src/components/ReduxLiveInspector';
import { StatsControlPanel } from './src/components/StatsControlPanel';
import { colors } from './src/components/ui/theme';

// Las 4 zonas son hermanas y NO reciben props: todas leen y escriben en el Redux Store.
// El HUD queda fijo arriba (stickyHeaderIndices) para ver el "efecto dominó" mientras se hace scroll.
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={styles.content}>
            <Text style={styles.title}>⚔️ HeroForge RPG</Text>
            <View style={styles.sticky}>
              <HeroAvatarHUD />
            </View>
            <StatsControlPanel />
            <ArmoryGrid />
            <ReduxLiveInspector />
          </ScrollView>
          <StatusBar style="light" />
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center', marginVertical: 10 },
  sticky: { backgroundColor: colors.background, paddingTop: 4 },
});
