import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import * as path from "path";
import * as pipelines from "aws-cdk-lib/pipelines";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

export class SphinxDocumentationPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      synth: new pipelines.CodeBuildStep("Synth", {
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.fromAsset(this, "Image", {
            directory: path.join(__dirname, "..", "..", "sphinx-docker"),
          }),
        },
        input: pipelines.CodePipelineSource.connection(
          "jumic/sphinx-documentation-pipeline",
          "main",
          {
            connectionArn:
              "arn:aws:codestar-connections:eu-central-1:352770552266:connection/f10d531d-7adf-45ab-811d-fa114d9e518c",
          }
        ),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
      dockerEnabledForSelfMutation: true,
    });

    pipeline.addStage(new SphinxDocumentationStage(this, "Deployment"));
  }
}

export class SphinxDocumentationAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const documentationBucket = new s3.Bucket(this, "DocumentationBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: { origin: new origins.S3Origin(documentationBucket) },
    });

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [
        s3deploy.Source.asset(
          path.join(__dirname, "..", "..", "documentation", "_build", "html")
        ),
      ],
      destinationBucket: documentationBucket,
      distribution,
    });
  }
}

class SphinxDocumentationStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new SphinxDocumentationAppStack(this, "SphinxDocumentationStage");
  }
}
