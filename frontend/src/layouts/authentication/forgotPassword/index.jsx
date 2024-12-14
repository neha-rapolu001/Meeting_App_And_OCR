import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Container,
  Row,
  Col
} from 'reactstrap';

function ForgotPassword() {
    return (
      <div className="center-fullscreen">
        <Card className="vertical-card">
          <CardBody>
            <Card className="my-card">
              <CardBody className="my-card-body">
                <Form>
                  <Card className="my-card">
                    <CardBody className="my-card-body">
                      <Row>
                        <FormGroup>
                          <Label for="username" className="form-label">
                             Email
                          </Label>
                          <Input type="text" name="username" id="username" placeholder="Enter your username" />
                        </FormGroup>
                        <div className="mt-2">
                          <a className="link-text" href="/">Back to login</a>
                        </div>
                      </Row>
                      <Row>
                        <div style={{display: "flex", justifyContent: "center"}}>
                          <Card className="outer-card">
                            <CardBody>
                              <Button color="success">
                                Send Email
                              </Button>
                            </CardBody>
                          </Card>
                        </div>
                      </Row>
                    </CardBody>
                  </Card>
                </Form>
              </CardBody>
            </Card>
          </CardBody>
        </Card>
      </div>
    );
  }

export default ForgotPassword;
