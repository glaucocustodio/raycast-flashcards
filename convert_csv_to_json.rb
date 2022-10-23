require 'csv'
require 'pry'
require 'json'

# convert cram.com's csv export to compatible json format (choose custom as separator and use ###)
hash = CSV.open('cards.csv', "r", :col_sep => "###").map do |row|
  {
    front: row[0],
    back: row[1],
    id: rand(10_000_0000..90_000_0000),
    created_at: Time.now.strftime("%d/%m/%Y, %H:%M:%S")
  }
end

json = JSON.pretty_generate(hash)
File.write('.flashcards.json', json)
