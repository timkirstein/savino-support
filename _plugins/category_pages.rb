module Savino
  class CategoryPage < Jekyll::PageWithoutAFile
    def initialize(site, category, posts)
      slug = Jekyll::Utils.slugify(category)
      super(site, site.source, File.join('blogg', 'kategori', slug), 'index.html')

      self.data['layout']    = 'category'
      self.data['title']     = category
      self.data['category']  = category
      self.data['posts']     = posts
      self.data['permalink'] = "/blogg/kategori/#{slug}/"
    end
  end

  class CategoryPageGenerator < Jekyll::Generator
    safe true

    def generate(site)
      site.categories.each do |category, posts|
        site.pages << CategoryPage.new(site, category, posts.sort_by(&:date).reverse)
      end
    end
  end
end
