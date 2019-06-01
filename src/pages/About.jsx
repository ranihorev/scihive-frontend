import React from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import Grid from '@material-ui/core/Grid';
import TweetEmbed from 'react-tweet-embed';
import PrimaryAppBar from '../components/TopBar/PrimaryAppBar';

const styles = () => ({
  root: {
    maxWidth: 992,
    padding: 20,
    lineHeight: 1.8,
    fontSize: 16,
    margin: 'auto',
  },
});

const otherProjects = [
  'Arxiv-Sanity.com',
  'FermatsLibrary.com',
  'SemanticScholar.org',
  'scholar.google.com',
  'paperswithcode.com',
  'BenchSci.com',
  'arXiv.org',
  'biorxiv.org',
  'Mendeley.com',
  'ReadCube.com',
  'Authorea.com',
  'Overleaf.com',
  'ShareLatex.com',
  'MathPix.com',
  'Meta.org',
  'PubPeer.com',
  'OpenReview.net',
  'PeerLibrary.org',
  'arxiv-vanity.com',
  'Quora.com',
  'GroundAI.com',
];

const About = ({ classes }) => {
  return (
    <React.Fragment>
      <PrimaryAppBar />
      <Grid container className={classes.root}>
        <Grid container direction="row" justify="center">
          <Grid item>
            <div>
              <p>Welcome,</p>

              <p>
                Scientific research has gone a long way since the scientific revolution started in the 16th century.
                While many processes like peer reviewed publications are finally streamlined, a significant part of
                research endeavors suffers from inefficiencies. These inefficiencies, if addressed, can accelerate the
                rate, quality and novelty of scientific discoveries.
              </p>

              <p>
                SciHive is a free,{' '}
                <a href="https://github.com/ranihorev/scihive-frontend" target="_blank" rel="noopener noreferrer">
                  open-source
                </a>{' '}
                tool that is built by researchers for researchers.
              </p>

              <p>
                Our mission is to leverage technology to accelerate the pace of research and scientific progress. If you
                would like to join our team or suggest feedback, please email us at hello(@)scihive.org.
              </p>

              <p>Curiousity starts here.</p>

              <TweetEmbed id="1131580388449480706" options={{ cards: 'hidden', align: 'center' }} />

              <h4 style={{ marginTop: 40, marginBottom: 5 }}>Credits</h4>
              <small>
                SciHive was initially forked from{' '}
                <a href="http://www.arxiv-sanity.com" target="_blank" rel="noopener noreferrer">
                  Arxiv-Sanity.com
                </a>{' '}
                by Andrej Karpathy.
              </small>

              <h4 style={{ paddingTop: 20, marginBottom: 5 }}>Other cool research-related projects</h4>

              {otherProjects.map((name, idx) => (
                <div key={idx}>
                  <small>
                    <a href={`http://${name}`} target="_blank" rel="noopener noreferrer">
                      {name}
                    </a>
                  </small>
                </div>
              ))}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(About);
