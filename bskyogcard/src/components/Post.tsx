/* eslint-disable bsky-internal/avoid-unwrapped-text, react-native-a11y/has-valid-accessibility-ignores-invert-colors */
import React from 'react'
import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyGraphDefs,
  AppBskyGraphStarterpack,
} from '@atproto/api'

import {atoms as a, gradient, theme as t} from '../theme/index.js'
import {formatCount} from '../util/formatCount.js'
import {formatDate} from '../util/formatDate.js'
import {getStarterPackImageUri} from '../util/getStarterPackImageUri.js'
import {Image as ImageSource, PostData} from '../util/resolvePostData.js'
import {Box} from './Box.js'
import * as Grid from './Grid.js'
import {CircleInfo} from './icons/CircleInfo.js'
import {Heart} from './icons/Heart.js'
import {Logomark} from './icons/Logomark.js'
import {Logotype} from './icons/Logotype.js'
import {Repost} from './icons/Repost.js'
import {Image} from './Image.js'
import {LinkCard} from './LinkCard.js'
import {RichText} from './RichText.js'
import {Text} from './Text.js'

export function Post({
  post,
  data,
}: {
  post: AppBskyFeedDefs.PostView
  data: PostData
}) {
  if (AppBskyFeedPost.isRecord(post.record)) {
    const avatar = data.images.get(post.author.avatar)
    const text = post.record.text
    const rt = data.texts.get(text)
    const hasInteractions = post.likeCount > 0 || post.repostCount > 0

    return (
      <Box
        cx={[
          a.flex,
          a.align_center,
          a.w_full,
          a.h_full,
          a.p_3xl,
          {
            backgroundImage: `linear-gradient(to bottom, ${gradient('sky')})`,
          },
        ]}>
        <Box
          cx={[a.flex, a.flex_col, a.w_full, a.p_xl, a.rounded_md, t.atoms.bg]}>
          <Box cx={[a.flex_row, a.align_center, a.gap_sm, a.pb_sm]}>
            <Box
              cx={[
                a.rounded_full,
                a.overflow_hidden,
                t.atoms.bg_contrast_25,
                {
                  width: '48px',
                  height: '48px',
                },
              ]}>
              {avatar && <Image height="100%" width="100%" image={avatar} />}
            </Box>
            <Box cx={[a.flex_col]}>
              <Text cx={[a.text_md, a.font_bold, a.pb_2xs]}>
                {post.author.displayName || post.author.handle}
              </Text>
              <Text cx={[a.text_sm, t.atoms.text_contrast_medium]}>
                @{post.author.handle}
              </Text>
            </Box>
          </Box>

          {rt && <RichText value={rt} />}

          {post.embed && (
            <Box cx={[a.pt_md]}>
              <Embeds embed={post.embed} data={data} />
            </Box>
          )}

          <Box cx={[a.flex_row, a.align_center, a.justify_between, a.pt_lg]}>
            <Text cx={[a.text_sm, t.atoms.text_contrast_medium]}>
              {formatDate(post.record.createdAt)}
            </Text>

            {!hasInteractions && <Logo />}
          </Box>

          {hasInteractions && (
            <Box cx={[a.pt_md]}>
              <Box
                cx={[
                  a.w_full,
                  a.pb_md,
                  a.border_t,
                  t.atoms.border_contrast_low,
                ]}
              />

              <Box cx={[a.flex_row, a.align_center, a.justify_between]}>
                <Box cx={[a.flex_row, a.align_center, a.gap_2xl]}>
                  {post.likeCount > 0 && (
                    <Box cx={[a.flex_row, a.align_center, a.gap_sm]}>
                      <Heart size={22} fill={t.palette.red_400} />
                      <Box
                        cx={[
                          a.text_sm,
                          a.font_bold,
                          t.atoms.text_contrast_medium,
                        ]}>
                        {formatCount(post.likeCount)}
                      </Box>
                    </Box>
                  )}
                  {post.repostCount > 0 && (
                    <Box cx={[a.flex_row, a.align_center, a.gap_sm]}>
                      <Repost size={22} fill={t.palette.green_600} />
                      <Box
                        cx={[
                          a.text_sm,
                          a.font_bold,
                          t.atoms.text_contrast_medium,
                        ]}>
                        {formatCount(post.repostCount)}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Logo />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  return null
}

export function Logo() {
  return (
    <Box cx={[a.flex_row, a.align_center]}>
      <Logomark size={20} fill={t.palette.primary_500} />
      <Box
        cx={[
          {
            paddingTop: '3px',
            paddingLeft: '6px',
          },
        ]}>
        <Logotype size={64} fill={t.palette.contrast_800} />
      </Box>
    </Box>
  )
}

export function Embeds({
  embed,
  data,
  hideNestedEmbeds,
}: {
  embed: AppBskyFeedDefs.PostView['embed']
  data: PostData
  hideNestedEmbeds?: boolean
}) {
  if (AppBskyEmbedExternal.isView(embed)) {
    const {title, description, uri, thumb} = embed.external
    const image = data.images.get(thumb)
    return (
      <LinkCard
        image={image}
        title={title}
        description={description}
        uri={uri}
      />
    )
  }

  if (AppBskyEmbedImages.isView(embed)) {
    const {images} = embed

    if (images.length > 0) {
      const imgs = images.map(({fullsize}) => data.images.get(fullsize))
      if (imgs.length === 1) {
        return (
          <Box cx={[a.rounded_sm, a.w_full, a.overflow_hidden]}>
            <Image image={imgs[0]} />
          </Box>
        )
      } else if (imgs.length === 2) {
        return (
          <Grid.Row gutter={a.p_xs.padding}>
            <Grid.Column gutter={a.p_xs.padding} width={1 / 2}>
              <SquareImage image={imgs[0]} />
            </Grid.Column>
            <Grid.Column gutter={a.p_xs.padding} width={1 / 2}>
              <SquareImage image={imgs[1]} />
            </Grid.Column>
          </Grid.Row>
        )
      } else if (imgs.length === 3) {
        return (
          <Grid.Row gutter={a.p_xs.padding}>
            <Grid.Column gutter={a.p_xs.padding} width={2 / 3}>
              <SquareImage image={imgs[0]} />
            </Grid.Column>
            <Grid.Column gutter={a.p_xs.padding} width={1 / 3} cx={[a.gap_sm]}>
              <SquareImage image={imgs[1]} />
              <SquareImage image={imgs[2]} />
            </Grid.Column>
          </Grid.Row>
        )
      } else {
        return (
          <Grid.Row gutter={a.p_xs.padding}>
            <Grid.Column gutter={a.p_xs.padding} width={1 / 2} cx={[a.gap_sm]}>
              <SquareImage image={imgs[0]} />
              <SquareImage image={imgs[1]} />
            </Grid.Column>
            <Grid.Column gutter={a.p_xs.padding} width={1 / 2} cx={[a.gap_sm]}>
              <SquareImage image={imgs[2]} />
              <SquareImage image={imgs[3]} />
            </Grid.Column>
          </Grid.Row>
        )
      }
    }
  }

  if (AppBskyEmbedRecord.isView(embed)) {
    if (AppBskyFeedDefs.isGeneratorView(embed.record)) {
      return <FeedCard embed={embed.record} data={data} />
    }
    if (AppBskyGraphDefs.isListView(embed.record)) {
      return <ListCard embed={embed.record} data={data} />
    }
    if (
      AppBskyGraphDefs.isStarterPackViewBasic(embed.record) &&
      AppBskyGraphStarterpack.isRecord(embed.record.record)
    ) {
      const uri = getStarterPackImageUri(embed.record)
      const {name, description} = embed.record.record
      const image = data.images.get(uri)
      return <LinkCard image={image} title={name} description={description} />
    }
    return <QuoteEmbed embed={embed} data={data} />
  }

  if (AppBskyEmbedRecordWithMedia.isView(embed)) {
    return (
      <Box cx={[a.gap_md]}>
        <Embeds embed={embed.media} data={data} />
        {!hideNestedEmbeds && <QuoteEmbed embed={embed.record} data={data} />}
      </Box>
    )
  }

  return null
}

export function FeedCard({
  embed,
  data,
}: {
  embed: AppBskyFeedDefs.GeneratorView
  data: PostData
}) {
  const {avatar, displayName, likeCount, creator} = embed
  const image = data.images.get(avatar)
  return (
    <Box
      cx={[
        a.w_full,
        a.gap_sm,
        a.rounded_sm,
        a.p_md,
        a.border,
        t.atoms.border_contrast_low,
      ]}>
      <Box cx={[a.flex_row, a.align_center, a.gap_sm]}>
        {image && (
          <Image
            image={image}
            cx={[
              a.rounded_sm,
              {
                width: '40px',
              },
            ]}
          />
        )}
        <Box cx={[a.pt_2xs]}>
          <Text cx={[a.text_md, a.font_bold, a.pb_2xs]}>{displayName}</Text>
          <Text cx={[a.text_sm, a.leading_snug]}>By @{creator.handle}</Text>
        </Box>
      </Box>

      {likeCount > 1 && (
        <Text cx={[a.text_sm, a.leading_snug]}>
          Liked by {formatCount(likeCount)} users
        </Text>
      )}
    </Box>
  )
}

export function ListCard({
  embed,
  data,
}: {
  embed: AppBskyGraphDefs.ListView
  data: PostData
}) {
  const {avatar, name, creator} = embed
  const image = data.images.get(avatar)
  return (
    <Box
      cx={[
        a.w_full,
        a.gap_sm,
        a.rounded_sm,
        a.p_md,
        a.border,
        t.atoms.border_contrast_low,
      ]}>
      <Box cx={[a.flex_row, a.align_center, a.gap_sm]}>
        {image && (
          <Image
            image={image}
            cx={[
              a.rounded_sm,
              {
                width: '40px',
              },
            ]}
          />
        )}
        <Box cx={[a.pt_2xs]}>
          <Text cx={[a.text_md, a.font_bold, a.pb_2xs]}>{name}</Text>
          <Text cx={[a.text_sm, a.leading_snug]}>By @{creator.handle}</Text>
        </Box>
      </Box>
    </Box>
  )
}

export function SquareImage({image}: {image: ImageSource}) {
  return (
    <Box
      cx={[
        a.relative,
        a.rounded_sm,
        a.overflow_hidden,
        a.w_full,
        t.atoms.bg_contrast_25,
        {paddingTop: '100%'},
      ]}>
      <Image
        image={image}
        cx={[
          a.absolute,
          a.inset_0,
          {
            objectFit: 'cover',
          },
        ]}
      />
    </Box>
  )
}

export function QuoteEmbed({
  embed,
  data,
}: {
  embed: AppBskyEmbedRecord.View
  data: PostData
}) {
  if (
    AppBskyEmbedRecord.isViewRecord(embed.record) &&
    AppBskyFeedPost.isRecord(embed.record.value) &&
    AppBskyFeedPost.validateRecord(embed.record.value).success
  ) {
    const {author, value: post, embeds} = embed.record
    const avatar = data.images.get(author.avatar)
    const rt = data.texts.get(post.text)
    const notPublic = author.labels.some(l => l.val === `!no-unauthenticated`)

    if (notPublic) {
      return (
        <NotQuoteEmbed>
          The author of the quoted post has requested their posts not be
          displayed on external sites
        </NotQuoteEmbed>
      )
    }

    return (
      <Box
        cx={[
          a.w_full,
          a.p_md,
          a.rounded_sm,
          a.border,
          t.atoms.border_contrast_low,
        ]}>
        <Box cx={[a.flex_row, a.align_center, a.gap_xs, a.pb_sm]}>
          <Box
            cx={[
              a.rounded_full,
              a.overflow_hidden,
              t.atoms.bg_contrast_25,
              {
                width: '20px',
                height: '20px',
              },
            ]}>
            {avatar && <Image height="100%" width="100%" image={avatar} />}
          </Box>
          <Box cx={[a.flex_row, a.align_center, a.gap_xs]}>
            <Text cx={[a.text_sm, a.font_bold]}>
              {author.displayName || author.handle}
            </Text>
            <Text cx={[a.text_xs, t.atoms.text_contrast_medium]}>
              @{author.handle}
            </Text>
          </Box>
        </Box>

        {rt && (
          <Box>
            <RichText value={rt} cx={[a.text_sm]} />
          </Box>
        )}

        {Boolean(embeds && embeds.length) && (
          <Box cx={[a.pt_sm]}>
            <Embeds embed={embeds[0]} data={data} hideNestedEmbeds />
          </Box>
        )}
      </Box>
    )
  } else if (AppBskyEmbedRecord.isViewBlocked(embed.record)) {
    return <NotQuoteEmbed>Quoted post is blocked</NotQuoteEmbed>
  } else if (AppBskyEmbedRecord.isViewNotFound(embed.record)) {
    return (
      <NotQuoteEmbed>
        Quoted post not found, it may have been deleted.
      </NotQuoteEmbed>
    )
  } else if (AppBskyEmbedRecord.isViewDetached(embed.record)) {
    return <NotQuoteEmbed>Quoted post detached by author</NotQuoteEmbed>
  }
  return null
}

export function NotQuoteEmbed({children}: {children: React.ReactNode}) {
  return (
    <Box
      cx={[
        a.flex_row,
        a.align_center,
        a.gap_sm,
        a.rounded_sm,
        a.p_md,
        t.atoms.bg_contrast_25,
      ]}>
      <CircleInfo size={20} fill={t.atoms.text_contrast_low.color} />
      <Text cx={[a.text_sm, a.leading_snug, t.atoms.text_contrast_medium]}>
        {children}
      </Text>
    </Box>
  )
}
