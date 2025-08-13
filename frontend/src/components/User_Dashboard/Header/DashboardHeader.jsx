import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
} from "@mui/material";
import { Notifications, Mail, Menu } from "@mui/icons-material";

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit">
          <Menu />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          License Dashboard
        </Typography>
        <IconButton color="inherit">
          <Badge badgeContent={3} color="error">
            <Mail />
          </Badge>
        </IconButton>
        <IconButton color="inherit">
          <Badge badgeContent={5} color="error">
            <Notifications />
          </Badge>
        </IconButton>
        <Avatar sx={{ ml: 2 }}>U</Avatar>
      </Toolbar>
    </AppBar>
  );
}
