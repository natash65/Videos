import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';
import DOMPurify from 'dompurify'; // For sanitizing content

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const endpoint = "https://alcashzone.com/graphql";
  const graphQLClient = new GraphQLClient(endpoint);
  const referringURL = ctx.req.headers?.referer || null;
  const pathArr = ctx.query.postpath as Array<string>;
  const path = pathArr.join('/');
  console.log(path);
  const fbclid = ctx.query.fbclid;

  // Redirect logic remains the same

  const query = gql`
    {
      post(id: "/${path}/", idType: URI) {
        id
        excerpt
        title
        link
        dateGmt
        modifiedGmt
        content
        author {
          node {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  if (!data.post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      path,
      post: data.post,
      host: ctx.req.headers.host,
    },
  };
};

interface PostProps {
  post: any;
  host: string;
  path: string;
}

const Post: React.FC<PostProps> = (props) => {
  const { post, host, path } = props;

  // Sanitize content before rendering
  const cleanContent = DOMPurify.sanitize(post.content);

  const removeTags = (str: string) => {
    // ... (existing removeTags function)
  };

  return (
    <>
      <Head>
        {/* ... (existing Head content) */}
      </Head>
      <div className="post-container">
        <h1>{post.title}</h1>
        <img
          src={post.featuredImage.node.sourceUrl}
          alt={post.featuredImage.node.altText || post.title}
          onError={(error) => {
            // Set a placeholder image or handle error gracefully
            error.target.src = 'path/to/placeholder.png';
          }}
        />
        <article dangerouslySetInnerHTML={{ __html: cleanContent }} />
      </div>
    </>
  );
};

export default Post;
