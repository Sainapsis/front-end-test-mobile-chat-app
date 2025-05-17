import { ThemeColors } from '@/src/presentation/constants/Colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: ThemeColors.gray,
  },
  listContainer: {
    paddingBottom: 20,
  },
}); 

export default styles;