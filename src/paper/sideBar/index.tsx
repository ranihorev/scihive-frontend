import { Collapse, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import ChatIcon from '@material-ui/icons/Chat';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import React from 'react';
import { SidebarComments } from '../highlights/sidebar';
import { Info } from '../paperInfo';
import { PaperSections } from '../sections';
import styles from './styles.module.scss';

const CollapsibleItem: React.FC<{ icon?: React.ReactElement; title: string }> = ({ icon, title, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <ListItem button onClick={() => setIsOpen(state => !state)}>
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText primary={title} />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpen} timeout={300} unmountOnExit>
        <ListItem>{children}</ListItem>
      </Collapse>
    </>
  );
};

export const Sidebar: React.FC<{ isDrawerOpen: boolean; setIsDrawerOpen: React.Dispatch<boolean> }> = React.memo(
  ({ isDrawerOpen, setIsDrawerOpen }) => {
    return (
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
      >
        <List component="nav" className={styles.list}>
          <CollapsibleItem icon={<InfoIcon />} title="Paper Details">
            <Info />
          </CollapsibleItem>
          <CollapsibleItem icon={<AccountTreeIcon />} title="Sections">
            <PaperSections />
          </CollapsibleItem>
          <CollapsibleItem icon={<ChatIcon />} title="Comments">
            <SidebarComments />
          </CollapsibleItem>
        </List>
      </Drawer>
    );
  },
);

Sidebar.displayName = 'Sidebar';
