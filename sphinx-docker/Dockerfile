FROM sphinxdoc/sphinx

WORKDIR /docs
RUN apt-get update
RUN apt-get -y install curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash
RUN apt-get install nodejs
ADD requirements.txt /docs
RUN pip3 install -r requirements.txt
