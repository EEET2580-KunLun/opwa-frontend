import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#0044cc',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: '#f44336',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                fullWidth: true,
            },
        },
    },
});

export default theme;