import { defineField, defineType } from 'sanity';

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'productId',
      title: 'Product ID',
      type: 'string',
      description: 'Stable id exposed by the API. Keep it unique.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gender',
      title: 'Gender',
      type: 'string',
      options: { list: ['Male', 'Female'], layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sizes',
      title: 'Sizes',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'baseColor',
      title: 'Base colour',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'discountedPrice',
      title: 'Discounted price',
      type: 'number',
      description: 'Leave empty when the product is not on sale.',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'imageUrl',
      title: 'External image URL',
      type: 'url',
      description: 'Used when no image asset is uploaded.',
    }),
    defineField({
      name: 'imageAlt',
      title: 'External image alt text',
      type: 'string',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['jacket', 'mens', 'womens'] },
    }),
    defineField({
      name: 'favorite',
      title: 'Favourite',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'baseColor', media: 'image' },
  },
});
