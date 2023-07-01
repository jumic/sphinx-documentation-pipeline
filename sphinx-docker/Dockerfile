FROM sphinxdoc/sphinx-latexpdf

WORKDIR /docs
RUN apt-get update
RUN apt-get -y install curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get install nodejs
RUN node -v
ADD requirements.txt /docs
RUN pip3 install -r requirements.txt
