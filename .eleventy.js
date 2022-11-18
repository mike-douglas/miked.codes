module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy('images')
  eleventyConfig.addPassthroughCopy('css')
  eleventyConfig.addPassthroughCopy('js')

  eleventyConfig.addNunjucksFilter('limit', (collection, num) => {
    return collection.slice(0, num)
  })

  const figure = (image, cssClass, caption) => {
    return (`<figure class="${cssClass}"><img src="${image}" alt="${caption}"><figcaption>${caption}</figcaption></figure>`)
  }

  eleventyConfig.addPairedShortcode('image', (caption, image) => {
    return figure(image, '', caption)
  })

  eleventyConfig.addPairedShortcode('wideimage', (caption, image) => {
    return figure(image, 'wide', caption)
  })

  eleventyConfig.addPairedShortcode('fullimage', (caption, image) => {
    return figure(image, 'full', caption)
  })

  eleventyConfig.addPairedShortcode('galleryimage', (caption, image) => {
    return figure(image, 'gallery-image', caption)
  })

  eleventyConfig.addPairedShortcode('gallery', (content) => {
    return (`<div class="gallery"><div class="gallery-row">${content}</div></div>`)
  })
}