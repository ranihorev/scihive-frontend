import { Collapse, Drawer, List, ListItem, ListItemIcon, ListItemText, useScrollTrigger } from '@material-ui/core';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import ChatIcon from '@material-ui/icons/Chat';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import MenuIcon from '@material-ui/icons/Menu';
import cx from 'classnames';
import React from 'react';
import { SidebarComments } from '../highlights/sidebar';
import { Info } from '../paperInfo';
import { PaperSections } from '../sections';
import styles from './styles.module.scss';

const CollapsibleItem: React.FC<{ icon?: React.ReactElement; title: string; openOnMount?: boolean }> = ({
  icon,
  title,
  openOnMount = false,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(openOnMount);
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

const FloatingMenuButton: React.FC<{ onClick: () => void; children: React.ReactElement }> = ({ onClick, children }) => {
  return (
    <div onClick={onClick} className={styles.button}>
      {children}
    </div>
  );
};

export const Sidebar: React.FC = React.memo(() => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const trigger = useScrollTrigger({ target: window });
  const menuItems = {
    info: {
      icon: <InfoIcon />,
      title: 'Paper Details',
      element: <Info />,
    },
    sections: {
      icon: <AccountTreeIcon />,
      title: 'Sections',
      element: <PaperSections />,
    },
    comments: {
      icon: <ChatIcon />,
      title: 'Comments',
      element: <SidebarComments />,
    },
  };

  const [openItem, setOpenItem] = React.useState<keyof typeof menuItems>();

  return (
    <React.Fragment>
      {!isDrawerOpen && (
        <div className={cx(styles.floatingMenu, { [styles.scrolled]: trigger })}>
          <FloatingMenuButton
            onClick={() => {
              setIsDrawerOpen(true);
            }}
          >
            <MenuIcon fontSize="small" />
          </FloatingMenuButton>
          {Object.entries(menuItems).map(([key, item]) => (
            <FloatingMenuButton
              key={key}
              onClick={() => {
                setIsDrawerOpen(true);
                setOpenItem(key as keyof typeof menuItems);
              }}
            >
              {React.cloneElement(item.icon, { fontSize: 'small' })}
            </FloatingMenuButton>
          ))}
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
          {Object.entries(menuItems).map(([key, item]) => (
            <CollapsibleItem key={key} icon={item.icon} title={item.title} openOnMount={key === openItem}>
              {item.element}
            </CollapsibleItem>
          ))}
        </List>
      </Drawer>
    </React.Fragment>
  );
});

Sidebar.displayName = 'Sidebar';
