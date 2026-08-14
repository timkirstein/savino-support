module Savino
  class CategoryPage < Jekyll::PageWithoutAFile
    def initialize(site, category, posts)
      slug = Jekyll::Utils.slugify(category)
      super(site, site.source, File.join('blogg', 'kategori', slug), 'index.html')

      if category == 'Guide'
        title       = 'Guider'
        description = 'Savinos guider til vinvalg – praktiske tips utenom de faste matparingene.'
      else
        title       = "Vin til #{category.downcase}"
        description = "Savinos vinparinger i kategorien #{category.downcase} – finn riktig vin til maten."
      end

      self.data['layout']      = 'category'
      self.data['title']       = title
      self.data['description'] = description
      self.data['category']    = category
      self.data['posts']       = posts
      self.data['permalink']   = "/blogg/kategori/#{slug}/"
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
