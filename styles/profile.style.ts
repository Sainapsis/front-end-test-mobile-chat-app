import { ThemeColors } from '@/constants/Colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  textCenter: {
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  statusText: {
    fontSize: 16,
    color: ThemeColors.gray,
  },
  section: {
    padding: 20,
    marginTop: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 10,
    width: 100,
  },
  detailLabel: {
    color: ThemeColors.gray,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default styles;