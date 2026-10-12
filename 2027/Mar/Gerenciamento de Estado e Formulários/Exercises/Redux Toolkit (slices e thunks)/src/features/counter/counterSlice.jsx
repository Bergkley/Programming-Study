import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"


export const incrementAfterDelay = createAsyncThunk(
  "counter/incrementAfterDelay",
  async (amount) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return amount
  }
)

const initializedValue = {
    value: 0
}

export const counterSlice = createSlice({
    name: "counter",
    initialState: initializedValue,
    reducers: {
        increment: (state) => {
            state.value += 1
        },
        incrementAmount: (state, action) => {
            state.value += action.payload
        },
        deleteIncrement: (state) => {
            state.value -= 1
        },
        resetAllIncrement: (state) => {
            state.value = 0
        }
    },
    extraReducers: (builder) => {
        builder.addCase(incrementAfterDelay.fulfilled, (state, action) => {
            state.value += action.payload
        })
    }
})


export const { increment, incrementAmount, deleteIncrement, resetAllIncrement, } = counterSlice.actions

export const counterReducer = counterSlice.reducer
