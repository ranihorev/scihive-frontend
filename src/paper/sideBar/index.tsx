import {
  CircularProgress,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useScrollTrigger,
} from '@material-ui/core';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import ChatIcon from '@material-ui/icons/Chat';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import cx from 'classnames';
import React from 'react';
import { usePaperStore } from '../../stores/paper';
import { HelpTooltip } from '../../utils/HelpTooltip';
import { Spacer } from '../../utils/Spacer';
import { SidebarComments } from '../highlights/sidebar';
import { Info } from '../paperInfo';
import { TableOfContents } from '../sections';
import styles from './styles.module.scss';

const RenderIfReady: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isFetching = usePaperStore(state => state.metadataState === 'Fetching');
  if (isFetching) {
    return (
      <div className="flex flex-row items-center">
        <Typography variant="body2" color="textSecondary">
          Analyzing document. This could take 2-3 minutes...
        </Typography>
        <Spacer size={8} />
        <CircularProgress size={10} />
      </div>
    );
  }
  return children;
};

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

const FloatingMenuButton: React.FC<{ onClick: () => void; tooltip?: string; children: React.ReactElement }> = ({
  onClick,
  tooltip,
  children,
}) => {
  return (
    <div onClick={onClick} className={styles.button}>
      {tooltip ? (
        <HelpTooltip title={tooltip} placement="right">
          {children}
        </HelpTooltip>
      ) : (
        children
      )}
    </div>
  );
};

export const Sidebar: React.FC = React.memo(() => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const trigger = useScrollTrigger({ target: window });
  const menuItems = {
    info: {
      icon: <InfoIcon fontSize="small" />,
      title: 'Paper Details',
      element: (
        <RenderIfReady>
          <Info />
        </RenderIfReady>
      ),
    },
    sections: {
      icon: <AccountTreeIcon fontSize="small" />,
      title: 'Table of Contents',
      element: (
        <RenderIfReady>
          <TableOfContents setIsDrawerOpen={setIsDrawerOpen} />
        </RenderIfReady>
      ),
    },
    comments: {
      icon: <ChatIcon fontSize="small" />,
      title: 'Comments',
      element: <SidebarComments />,
    },
  };

  const [openItem, setOpenItem] = React.useState<keyof typeof menuItems>();

  return (
    <React.Fragment>
      {!isDrawerOpen && (
        <div className={cx(styles.floatingMenu, { [styles.scrolled]: trigger })}>
          {Object.entries(menuItems).map(([key, item]) => (
            <FloatingMenuButton
              key={key}
              tooltip={item.title}
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
        <div className="flex flex-row justify-end border-b border-solid border-gray-200 pb-1">
          <IconButton
            size="small"
            className="mt-1 mr-1"
            onClick={() => {
              setIsDrawerOpen(false);
            }}
          >
            <ChevronLeftIcon className="p-1 pointer" fontSize="large" color="primary" />
          </IconButton>
        </div>
        <List component="nav" className={cx(styles.drawerList, 'pb-16', 'pt-0')}>
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
