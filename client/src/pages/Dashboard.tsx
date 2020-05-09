import React from "react";
import Typography from "@material-ui/core/Typography";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  createStyles,
  IconButton,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Delete } from "@material-ui/icons";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { DELETE_POSTING, GET_CURRENT_USER } from "../graphql/queries";
import SignOutButton from "../components/SignOutButton";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    details: {
      display: "flex",
      flexDirection: "column",
    },
    content: {
      flex: "1 0 auto",
    },
    cover: {
      width: 151,
    },
    controls: {
      display: "flex",
      alignItems: "center",
      paddingLeft: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    deleteIcon: {
      height: 38,
      width: 38,
    },
  })
);

export default function Dashboard() {
  const classes = useStyles();
  const client = useApolloClient();
  const history = useHistory();
  const { data, loading } = useQuery(GET_CURRENT_USER, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message);
    },
  });
  const [deletePosting] = useMutation(DELETE_POSTING, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message);
    },
  });

  async function handleDelete(id: string) {
    await deletePosting({ variables: { id } });
    client.resetStore();
  }

  if (loading) return null;

  const user = data.currentUser;

  const { ownPostings } = user;

  return (
    <div>
      <div>
        <Typography component="h4" variant="h4">
          Welcome {user.email}
        </Typography>
        <SignOutButton />
      </div>
      {ownPostings.map((posting: any) => (
        <Card key={posting.id} className={classes.root}>
          <CardMedia
            className={classes.cover}
            title={posting.title}
            image={posting.imageUrls[0]}
          />
          <div className={classes.details}>
            <CardContent className={classes.content}>
              <Typography variant="h5" component="h5">
                {posting.title}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                ${posting.price}
              </Typography>
            </CardContent>
            <div className={classes.controls}>
              <IconButton
                aria-label="delete"
                onClick={() => handleDelete(posting.id)}
              >
                <Delete className={classes.deleteIcon} />
              </IconButton>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
