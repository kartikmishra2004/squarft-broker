import { createSlice } from '@reduxjs/toolkit';
import { requirementsData } from '../../data/requirements';

const requirementsSlice = createSlice({
    name: 'requirements',
    initialState: {
        list: requirementsData,
        isContactVerified: false,
    },
    reducers: {
        addRequirement: (state, action) => {
            state.list.unshift({
                id: state.list.length + 1,
                ...action.payload,
            });
        },
        updateRequirement: (state, action) => {
            const index = state.list.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = { ...state.list[index], ...action.payload };
            }
        },
        deleteRequirement: (state, action) => {
            state.list = state.list.filter(item => item.id !== action.payload);
        },
        setContactVerified: (state, action) => {
            state.isContactVerified = action.payload;
        },
    },
});

export const { addRequirement, updateRequirement, deleteRequirement, setContactVerified } = requirementsSlice.actions;
export default requirementsSlice.reducer;
