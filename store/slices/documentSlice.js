import { createSlice } from '@reduxjs/toolkit';
import { initialDocuments } from '../../data/documents';

const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    list: initialDocuments,
  },
  reducers: {
    addDocument: (state, action) => {
      // action.payload should be the doc object
      state.list.push(action.payload);
    },
    removeDocument: (state, action) => {
      // action.payload should be the doc id
      state.list = state.list.filter(doc => doc.id !== action.payload);
    },
    updateDocument: (state, action) => {
      const index = state.list.findIndex(doc => doc.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    }
  },
});

export const { addDocument, removeDocument, updateDocument } = documentSlice.actions;
export default documentSlice.reducer;
