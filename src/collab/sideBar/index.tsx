import { Collapse, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import React from 'react';
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
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <ListItem>{children}</ListItem>
      </Collapse>
    </>
  );
};

export const Sidebar: React.FC = React.memo(() => {
  return (
    <List component="nav" className={styles.list}>
      <CollapsibleItem icon={<InfoIcon />} title="Paper Details">
        <Info />
      </CollapsibleItem>
      <CollapsibleItem icon={<AccountTreeIcon />} title="Sections">
        <PaperSections />
      </CollapsibleItem>
    </List>
  );
});

Sidebar.displayName = 'Sidebar';
