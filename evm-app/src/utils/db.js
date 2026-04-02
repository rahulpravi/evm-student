import localforage from 'localforage';

export const saveElection = async (electionData) => {
  const existingElections = await localforage.getItem('elections') || [];
  const newElection = {
    ...electionData,
    id: Date.now().toString(),
    status: 'active', 
    createdAt: new Date().toISOString(),
    votes: {} // വോട്ടുകൾ സേവ് ചെയ്യാൻ (ഉദാ: { 'candidate1': 5, 'nota': 2 })
  };
  const updatedElections = [...existingElections, newElection];
  await localforage.setItem('elections', updatedElections);
  return newElection;
};

export const getAllElections = async () => {
  return await localforage.getItem('elections') || [];
};

export const getElectionById = async (id) => {
  const elections = await getAllElections();
  return elections.find(e => e.id === id);
};

export const updateElection = async (id, updatedData) => {
  const elections = await getAllElections();
  const updatedElections = elections.map(e => e.id === id ? { ...e, ...updatedData } : e);
  await localforage.setItem('elections', updatedElections);
  return true;
};
