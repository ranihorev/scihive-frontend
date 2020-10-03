import {
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useScrollTrigger,
} from '@material-ui/core';
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
import MenuIcon from '@material-ui/icons/Menu';
import cx from 'classnames';

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

export const Sidebar: React.FC = React.memo(() => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const trigger = useScrollTrigger({ target: window });
  console.log(trigger);
  return (
    <React.Fragment>
      {!isDrawerOpen && (
        <div className={cx(styles.floatingMenu, { [styles.scrolled]: trigger })}>
          <div
            onClick={() => {
              setIsDrawerOpen(state => !state);
            }}
          >
            <MenuIcon className={styles.button} />
          </div>
        </div>
      )}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
      >
        <List component="nav" className={styles.drawerList}>
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
    </React.Fragment>
  );
});

Sidebar.displayName = 'Sidebar';
