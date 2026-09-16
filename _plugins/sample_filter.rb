# Liquid filter: {{ array | sample_n: 4 }} — random subset, re-picked on
# every `jekyll build`. Liquid 4.x (this site's version) has no built-in
# `sample` filter, so this wraps Ruby's Array#sample.
module Jekyll
  module SampleFilter
    def sample_n(array, n)
      return array unless array.respond_to?(:sample)
      array.sample(n.to_i)
    end
  end
end

Liquid::Template.register_filter(Jekyll::SampleFilter)
