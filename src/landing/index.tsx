import { Typography, Link } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import EmailIcon from '@material-ui/icons/Email';
import TwitterIcon from '@material-ui/icons/Twitter';
import cx from 'classnames';
import React from 'react';
import shallow from 'zustand/shallow';
import { LoginForm } from '../auth/LoginForm';
import baseStyles from '../base.module.scss';
import logoWhite from './images/logo_white.png';
import { useUserStore } from '../stores/user';
import { TopBar, TopBarButton } from '../topBar';
import BlueHiveBG from './images/blue_hive_bg.png';
// import chrome_logo from './images/chrome_logo.png';
import collaborateImg from './images/Collaborate.gif';
import berkeley from './images/institutes_logos/berkeley.png';
import harvard from './images/institutes_logos/harvard.png';
import princeton from './images/institutes_logos/princeton.png';
import stanford from './images/institutes_logos/stanford.png';
import navigateImg from './images/Navigate.gif';
import organizeImg from './images/Organize.gif';
import { Link as RouterLink } from 'react-router-dom';

const FeatureText: React.FC<{ title: string; text: React.ReactElement }> = ({ text, title }) => {
  return (
    <div className="place-self-center text-center">
      <Typography className="font-medium text-xl md:text-2xl mb-2">{title}</Typography>
      <Typography variant="body1" className="leading-6">
        {text}
      </Typography>
    </div>
  );
};

const FeatureImg: React.FC<{ img: string; alt?: string }> = ({ img, alt = 'FeatureImg' }) => {
  return (
    <div className="place-self-center">
      <img className="border-solid border-1 border-main-color rounded-sm md:max-w-sm" src={img} alt="FeatureImg" />
    </div>
  );
};

const Feature: React.FC<{ className?: string }> = ({ className, children }) => {
  return (
    <div className={cx('mb-12 flex flex-col md:grid md:grid-cols-1 md:grid-cols-2 gap-6 w-full', className)}>
      {children}
    </div>
  );
};

const Section: React.FC<{ className?: string; container?: boolean }> = ({ className, container, children }) => (
  <div className={container ? 'lg:container mx-auto' : undefined}>
    <div className={cx(className, 'flex flex-col justify-center items-center py-8 md:py-16 px-4 md:px-8')}>
      {children}
    </div>
  </div>
);

const Title: React.FC<{ className?: string }> = ({ className, children }) => (
  <Typography variant="h4" className={cx('mb-10 text-center', className)}>
    {children}
  </Typography>
);

export const Landing: React.FC = () => {
  const { isLoggedIn } = useUserStore(state => ({ isLoggedIn: state.status === 'loggedIn' }), shallow);
  return (
    <div className={baseStyles.fullScreen}>
      <TopBar
        rightMenu={
          isLoggedIn ? (
            <TopBarButton to="/library">Library</TopBarButton>
          ) : (
            <TopBarButton to="/discover">Discover</TopBarButton>
          )
        }
      />
      <div>
        <div className="flex justify-center items-center">
          <img src={BlueHiveBG} alt="Blue background" width="100%" />
          <Typography className="text-2xl md:text-4xl font-medium text-white absolute">
            Smarter Science Together
          </Typography>
        </div>

        <Section className="text-center" container>
          <Typography className="text-xl font-medium">
            SciHive is a free and open-source tool to collaboratively read papers.
          </Typography>
          <br />
          <Typography className="text-xl font-medium">
            Our mission is to leverage technology to accelerate the pace of research and scientific discovery.
          </Typography>
          <br />
        </Section>
        <Section className="bg-gray-100">
          <Title>Get Started</Title>
          <div className="px-4">
            <LoginForm />
          </div>
        </Section>

        <Section container>
          <Title>Features</Title>

          <Feature>
            <FeatureText
              title="Collaborate"
              text={
                <>
                  Read the papers you care about collaboratively.
                  <br />
                  Add questions, comments, and highlights.
                </>
              }
            />
            <FeatureImg img={collaborateImg} />
          </Feature>

          <Feature className="flex-col-reverse">
            <FeatureImg img={navigateImg} />
            <FeatureText
              title="Navigate"
              text={
                <>
                  Start navigating papers like a champ.
                  <br />
                  <br />
                  Access references by the click of a button, instead of searching the literature manually.
                  <br />
                  SciHive also generates a convenient table of contents and deciphers acronyms automatically for you.
                </>
              }
            />
          </Feature>

          <Feature>
            <FeatureText
              title="Organize"
              text={
                <>
                  SciHive lets you create your own papers library.
                  <br />
                  Organize papers in collections for easy and efficient access for yourself and your peers.
                </>
              }
            />
            <FeatureImg img={organizeImg} />
          </Feature>
        </Section>

        <Section container className="bg-gray-100">
          <Title>Used by top scientists in top institutes</Title>
          <div className="grid grid-cols-4 gap-4">
            {[princeton, stanford, harvard, berkeley].map(item => (
              <img src={item} key={item} alt="Princeton" className="w-24 place-self-center" />
            ))}
          </div>
        </Section>

        {/* <div className={classes.blueBanner}>
          <div>
            <Typography variant="h4" component="h3">
              Download our Chrome extension
              <br />
              to use SciHive for all of your papers
            </Typography>
          </div>
          <div>
            <a
              href="https://chrome.google.com/webstore/detail/scihive/dijdhkcfdaocpepndegmbkgphbpomdai?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={chrome_logo} alt="Chrome" width="70%" />
            </a>
          </div>
        </div> */}

        <Section>
          <img src={logoWhite} alt="Logo" className="h-20" />
          <Typography variant="body1" className="mt-2">
            &copy; 2020 SciHive.Org
          </Typography>

          <div className="mt-4">
            <IconButton aria-label="E-mail us">
              <a href="mailto:hello@scihive.org">
                <EmailIcon fontSize="large" />
              </a>
            </IconButton>
            <IconButton aria-label="Follow SciHive on Twitter">
              <a href="https://twitter.com/SciHiveOrg" target="_blank" rel="noopener noreferrer">
                <TwitterIcon fontSize="large" />
              </a>
            </IconButton>
          </div>
          <div className="mt-8 flex flex-col items-center space-y-4">
            <Link component={RouterLink} to="/privacy-policy" className="text-gray-800 text-sm">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms-of-service" className="text-gray-800 text-sm">
              Terms of Service
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
};
