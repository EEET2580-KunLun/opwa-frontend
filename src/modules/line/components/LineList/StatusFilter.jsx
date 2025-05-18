import { Button, Stack, Typography, Box } from "@mui/material";
import { FaCheckCircle, FaExclamationTriangle, FaSyncAlt } from "react-icons/fa";

export const StatusFilter = ({ currentStatus, onStatusChange }) => {
    const statuses = ["ACTIVE", "EMERGENCY", "MAINTENANCE"];

    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body1">Status:</Typography>
            <Box sx={{ display: "flex" }}>
                {statuses.map(status => (
                    <Button
                        key={status}
                        variant={currentStatus === status ? "contained" : "outlined"}
                        color={currentStatus === status ? "primary" : "default"}
                        size="small"
                        onClick={() => onStatusChange(status)}
                        sx={{
                            mx: 0.5,
                            textTransform: "capitalize",
                            fontWeight: currentStatus === status ? "bold" : "normal"
                        }}
                    >
                        {status === "ACTIVE" && <FaCheckCircle style={{ marginRight: 4 }} />}
                        {status === "EMERGENCY" && <FaExclamationTriangle style={{ marginRight: 4 }} />}
                        {status === "MAINTENANCE" && <FaSyncAlt style={{ marginRight: 4 }} />}
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                    </Button>
                ))}
            </Box>
        </Stack>
    );
};