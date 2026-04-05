import AsyncStorage from '@react-native-async-storage/async-storage';

const ELECTIONS_KEY = 'elections_data';

export const saveElection = async (election) => {
  try {
    const existing = await getElections();
    existing.push(election);
    await AsyncStorage.setItem(ELECTIONS_KEY, JSON.stringify(existing));
    return true;
  } catch (e) { return false; }
};

export const getElections = async () => {
  try {
    const data = await AsyncStorage.getItem(ELECTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};

export const getElectionById = async (id) => {
  const elections = await getElections();
  return elections.find(e => e.id === id);
};

export const updateElection = async (id, updates) => {
  try {
    const elections = await getElections();
    const index = elections.findIndex(e => e.id === id);
    if (index !== -1) {
      elections[index] = { ...elections[index], ...updates };
      await AsyncStorage.setItem(ELECTIONS_KEY, JSON.stringify(elections));
      return true;
    }
    return false;
  } catch (e) { return false; }
};

export const deleteElection = async (id) => {
  try {
    const elections = await getElections();
    const filtered = elections.filter(e => e.id !== id);
    await AsyncStorage.setItem(ELECTIONS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) { return false; }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(ELECTIONS_KEY);
    return true;
  } catch (e) { return false; }
};
