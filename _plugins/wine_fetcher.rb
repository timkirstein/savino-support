require 'net/http'
require 'uri'
require 'json'
require 'digest'
require 'fileutils'

module Jekyll
  module WinePriceFilter
    def wine_price(price)
      return '' if price.nil?
      format('%.2f', price.to_f).gsub('.', ',') + ' kr'
    end
  end
end

Liquid::Template.register_filter(Jekyll::WinePriceFilter)

module Savino
  ENDPOINT  = 'https://europe-west1-grapemate-f80e3.cloudfunctions.net/blogSearchWines'
  CACHE_DIR = '.jekyll-cache/wine_fetcher'

  def self.fetch_wines(dish, api_key)
    cache_key  = Digest::MD5.hexdigest("#{dish}|100|500|3")
    cache_file = File.join(CACHE_DIR, "#{cache_key}.json")

    if File.exist?(cache_file)
      Jekyll.logger.info 'WineFetcher:', "Cache hit for '#{dish}'"
      return JSON.parse(File.read(cache_file))
    end

    FileUtils.mkdir_p(CACHE_DIR)

    uri  = URI(ENDPOINT)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl     = true
    http.read_timeout = 15

    req = Net::HTTP::Post.new(uri.path)
    req['Content-Type'] = 'application/json'
    req['X-Api-Key']    = api_key
    req.body = JSON.generate(
      dishText:   dish,
      priceMin:   100,
      priceMax:   500,
      maxResults: 3
    )

    res = http.request(req)

    unless res.is_a?(Net::HTTPSuccess)
      Jekyll.logger.warn 'WineFetcher:', "HTTP #{res.code} for '#{dish}'"
      return nil
    end

    data = JSON.parse(res.body)

    unless data['success']
      Jekyll.logger.warn 'WineFetcher:', "API failure for '#{dish}': #{data.inspect}"
      return nil
    end

    File.write(cache_file, JSON.generate(data))
    data
  rescue StandardError => e
    Jekyll.logger.warn 'WineFetcher:', "#{e.class}: #{e.message}"
    nil
  end
end

Jekyll::Hooks.register :posts, :pre_render do |post|
  dish = post.data['dish']
  next unless dish

  api_key = ENV['SAVINO_API_KEY']
  unless api_key
    Jekyll.logger.warn 'WineFetcher:', "SAVINO_API_KEY not set — skipping '#{dish}'"
    next
  end

  Jekyll.logger.info 'WineFetcher:', "Fetching wines for '#{dish}'…"
  data = Savino.fetch_wines(dish, api_key)
  next unless data

  post.data['wine_intro']           = data['introText']
  post.data['wine_recommendations'] = data['recommendations']
  Jekyll.logger.info 'WineFetcher:', "#{data['recommendations']&.length || 0} wines ready"
end
