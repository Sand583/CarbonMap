# The Value of Forest
See our video!
https://www.youtube.com/watch?v=ihp3MQ8Pj9w

Inspiration

Forests cover about 30% of the planet. The ecosystems they create play an essential role for life on earth. However deforestation is clearing earths forests on a massive scale. At the current rate of destruction the worlds rainforests could completely disappear within a hundred years.

How can we prevent the destruction of forests?

Deforestation occurs in the most part from human activity. This activity is mainly driven by financial incentives. To dissuade inhabitants from destroying forests we would need to offer a financial incentive not to.

In our market based society, conservation always considered as an externalities. Therefore it is always undervalued. We rarely consider the value of oxygen we breath or the carbon sequestered by forest. Making financing conservation efforts difficult.

Donations and philanthropies are usually the main source of conservation financing, but sometime we need to choose where to invest to get the highest value for money. That is where economic valuation of forest is important, and carbon storage is one of the environmental services provided by forests. There is already established an international carbon market, but it requires high technical expertise to valuate and verify the carbon. This capacity is usually not available in local communities safeguarding forest worldwide.

What it does
We built The Value of Forest (TheVoF) to enable local community objectively valuate the carbon stock value based on available carbon market price. Our app built off of google earth engines seeks to offer a solution to help preserve forests. Our app allows a user to select a region on a map. Then it calculates the forest value based on its carbon stock using an algorithm we developed. The user would then be given an opportunity to donate to or be encouraged to visit the region to support the conservation of its forests.

How we built it
We built the app using Google Earth Engine. WHRC has a global above ground biomass dataset, but it is only a onetime snapshot and with low spatial resolution. We develop the model correlating normalized difference vegetation index with WHRC dataset to come up with the regression formula. The model is hardcoded in to the app to make automation of carbon calculation.

Challenges we ran into
Actually finding the best dataset is proven to be difficult. We spent a lot of time experimenting with all available global dataset to come up with the current model.

Accomplishments that we're proud of
We manage to develop the model and create the automatization.

What we learned
Google Earth Engine

What's next for The Value of Forest
This is a proof of concept to connect community groups safeguarding forest and investors. In the future, we can add more visualization as dashboard for both groups. It can also be developed as an independent forest donation/investment platform. The data can also be used by philanthropies to monitor their investments.

Try it: https://safran-yusri.users.earthengine.app/view/valueforest
