import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Bookmark from "./Bookmark";
import CardActions from "@material-ui/core/CardActions";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Collapse from "@material-ui/core/Collapse";
import CardContent from "@material-ui/core/CardContent";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import classnames from "classnames";
import moment from 'moment';
import TwitterMeta from "./TwitterMeta";
import Button from "@material-ui/core/Button";


const styles = theme => ({
  root: {
    margin: "10px 0",
    width: '100%',
  },
  header: {
    // padding: 5,
    position: 'relative',
  },
  content: {
    paddingBottom: 0,
  },
  title: {
    marginRight: 40,
  },
  link: {
    color: '#333',
    textDecoration: "none",
    "&:hover": {
      color: '#878787',
    }
  },
  bookmark: {
    position: 'absolute',
    right: -8,
    top: -12,
    // marginLeft: "auto"
  },
  authors: {
    marginTop: 12,
    marginBottom: 12
  },
  date: {
    color: "textSecondary",
    fontSize: 11
  },
  actions: {
    display: "flex",
  },
  metadata: {
    marginRight: "6px",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: "rotate(180deg)"
  }
});

const PapersListItem = ({ paper, classes }) => {
  const {saved_in_library, comments_count, twtr_score, twtr_links, bookmarks_count} = paper;
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card classes={{root: classes.root}}>
      <CardContent className={classes.content}>
        <Grid container className={classes.header} direction={"row"} justify="space-between">
          <Grid item className={classes.title}>
            <Link
              to={`/paper/${paper._id}`}
              className={classes.link}
            >
              {paper.title}
            </Link>
          </Grid>
          <Grid item className={classes.bookmark}>
            <Bookmark paperId={paper._id} saved_in_library={saved_in_library}/>
          </Grid>
        </Grid>
        <Grid container className={classes.authors}>
          <Grid item>
            <Typography>
              {paper.authors.map((author, index) => (
                <React.Fragment key={index}>
                  <Link to={`/author/${author.name}`}>{author.name}</Link>
                  {index < paper.authors.length - 1 ? ", " : ""}
                </React.Fragment>
              ))}
            </Typography>
            <Typography className={classes.date}>
              {moment(paper.time_published).format('MMM DD, YYYY')}
            </Typography>
          </Grid>
        </Grid>

      </CardContent>
      <CardActions disableActionSpacing className={classes.actions}>
        <Button disabled={true}>
          <i className={`fas fa-comments ${classes.metadata}`}></i> {comments_count || "0"}
        </Button>
        <Button disabled={true}>
          <i className={`fa fa-star ${classes.metadata}`}></i> {bookmarks_count || "0"}
        </Button>
        <div><TwitterMeta twtr_score={twtr_score} twtr_links={twtr_links}/></div>
        <IconButton
          className={classnames(classes.expand, {
            [classes.expandOpen]: expanded
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="Show more"
        >
          <ExpandMoreIcon />
        </IconButton>{" "}
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider variant="middle" />
        <CardContent>
          <Typography paragraph>{paper.summary}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default withStyles(styles)(PapersListItem);
