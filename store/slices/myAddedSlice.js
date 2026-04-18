import { createSlice } from '@reduxjs/toolkit';
import { myAddedPropertiesData } from '../../data/myAddedProperties';

const myAddedSlice = createSlice({
    name: 'myAdded',
    initialState: {
        list: myAddedPropertiesData,
    },
    reducers: {
        addProperty: (state, action) => {
            state.list.unshift({
                id: state.list.length + 1,
                ...action.payload,
            });
        },
        removeProperty: (state, action) => {
            state.list = state.list.filter(item => item.id !== action.payload);
        },
        updatePropertyStatus: (state, action) => {
            const item = state.list.find(p => p.id === action.payload.id);
            if (item) item.status = action.payload.status;
        },
    },
});

export const { addProperty, removeProperty, updatePropertyStatus } = myAddedSlice.actions;
export default myAddedSlice.reducer;
