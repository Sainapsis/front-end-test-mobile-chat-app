import { StyleSheet } from 'react-native';

export const profileScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 60,
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
    color: '#8F8F8F',
    marginTop: 4,
  },
  section: {
    padding: 20,
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 10,
    width: 100,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 80, // Add padding to ensure the button is visible above the tab bar
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
